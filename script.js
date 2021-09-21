const resultsNav = document.getElementById('resultsNav');
const favoritesNav = document.getElementById('favoritesNav');
const imagesContainer = document.querySelector('.images-container');
const linkContainer = document.querySelector('.full-screen-container');
const saveConfirmed = document.querySelector('.save-confirmed');
const loader = document.querySelector('.loader-wrapper');
const likeBtn = document.createElement('a');

// NASA API
const count = 1;
const apiKey = 'QeNL0N8fiY0mmeSbb0xGwqNpeK2HW1lUxne0I1bB';
const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&count=${count}`;

let resultsArray = [];
let favorites = {};
let likesArray = [];

// Favourites Page
function showContent(page) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'results') {
        resultsNav.classList.remove('hidden');
        favoritesNav.classList.add('hidden');
        // View one image per page
        const section = document.getElementById('section');
        section.style.overflow = 'hidden';
        // Line up image descriptions on main page
        const cardBodyPos = document.querySelector('.card-body');
        cardBodyPos.style.position = 'fixed';;
        // cardBodyPos.style.bottom = '40px';
    } else {
        resultsNav.classList.add('hidden');
        favoritesNav.classList.remove('hidden');
        // View multiple images per page
        const section = document.getElementById('section');
        section.style.overflow = 'visible';
        // Remove overlay
        const overlay = document.getElementById('overlay');
        overlay.classList.add('hidden');
        // Change card styles on favourites page only
        imagesContainer.classList.add('images-faves');
        const cardBodyPos = document.querySelector('.card-body');
        cardBodyPos.style.bottom = '5px';
        cardBodyPos.style.background = 'none';
        const container = document.querySelector('.container');
        container.style.height = '100%';
    }
    loader.classList.add('hidden');
}

// Search Page
function createDOMNOdes(page) {
    const currentArray = page === 'results' ? resultsArray : Object.values(favorites);
    currentArray.forEach((result)  => {
        // Card Container
        const card = document.createElement('div');
        card.classList.add('card');
        // Link
        const link = document.createElement('a');
        link.href = result.hdurl;
        link.title = 'View Full Image';
        link.target = '_blank';
        // Image
        const image = document.createElement('img');
        image.src = result.url;
        image.alt = result.title;
        image.loading = 'lazy';
        image.classList.add('card-img-top');
        // Card Body
        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');
        cardBody.id = 'cardBodyPos';
        // Card Title
        const cardTitle = document.createElement('h5');
        cardTitle.classList.add('card-title');
        cardTitle.textContent = result.title;
        // Card Text
        const cardText = document.createElement('p');
        cardText.textContent = result.explanation;
        // Footer Container
        const footer = document.createElement('small');
        footer.classList.add('text-muted');
        // Date
        const date = document.createElement('strong');
        date.textContent = result.date;
        // Copyright
        const copyrightResult = result.copyright === undefined ? '' : result.copyright;
        const copyright = document.createElement('span');
        copyright.textContent = ` ${copyrightResult}`;
        // Footer Link Container
        const footerLink = document.createElement('div');
        footerLink.classList.add('footer-links');
        // Like Button
        const likeBtn = document.createElement('button');
        const likeBtnIcon = document.createElement('i');
        likeBtnIcon.classList.add('footer-btn', 'like-toggle', 'fa', 'fa-heart');
        likeBtnIcon.id = 'heart';
        likeBtnIcon.setAttribute('onclick', `addLikeFunc('${result.url}')`);
        likeBtnIcon.title = 'Like!';
        likeBtnIcon.ariaLabel = 'Like image';
        // Add Favourite Icon
        const saveTextBtn = document.createElement('button');
        const saveText = document.createElement('a');
        saveText.classList.add('footer-btn', 'star-toggle');
        saveText.title = 'Add to Favorites (remove on Favorites page)';
        saveText.ariaLabel = 'Add image to favourites';
        if (page === 'results') {
            saveText.classList.add('far', 'fa-star');
            saveText.setAttribute('onclick', `saveFavorite('${result.url}')`);
        } else {
            saveText.classList.add('fa', 'fa-star');
            saveText.setAttribute('onclick', `removeFavorite('${result.url}')`);
            saveText.title = 'Remove from Favorites';
        }
        // Card View Full Image Button
        const cardFullScreen = document.createElement('a');
        cardFullScreen.classList.add('footer-btn', 'full-screen', 'fa', 'fa-expand-alt');
        cardFullScreen.href = result.hdurl;
        cardFullScreen.title = 'View Full Image';
        cardFullScreen.target = '_blank';
        // Share Links
        const shareLinks = document.createElement('button');        
        const shareIcon = document.createElement('i');
        shareIcon.classList.add('footer-btn', 'fa', 'fa-share-alt', 'share-icon');
        shareIcon.setAttribute('onclick', `share()`);
        shareIcon.title = 'Share Image';
        shareIcon.ariaLabel = 'Share image';
        // Append
        shareLinks.appendChild(shareIcon);
        saveTextBtn.appendChild(saveText);
        likeBtn.appendChild(likeBtnIcon);
        footerLink.append(likeBtn, saveTextBtn, cardFullScreen, shareLinks);
        footer.append(date, copyright);
        cardBody.append(cardTitle, cardText, footer, footerLink );
        link.appendChild(image);
        card.append(link, cardBody);
        imagesContainer.appendChild(card);
    });
}

function updateDOM(page) {
    // Get Favourites from localStorage
    if (localStorage.getItem('nasaFavorites')) {
        favorites = JSON.parse(localStorage.getItem('nasaFavorites'));
    }
    imagesContainer.textContent = '';
    createDOMNOdes(page);
    showContent(page);
}

function updateDOMLikes(storedLikes) {
    // Get Likes from localStorage
    if (localStorage.getItem('likes')) {
        likes = JSON.parse(localStorage.getItem('likes'));
        console.log('likes from storage', likes);
    }
    likeColor(storedLikes);
    removeLike(storedLikes);
}

// Get Images from NASA API
async function getNasaPictures() {
    // Show Loader
    loader.classList.remove('hidden');
    try {
        const response = await fetch(apiUrl);
        resultsArray = await response.json();
        console.log(resultsArray);
        updateDOM('results');
        updateDOMLikes('resultsLikes')
    } catch (error) {
        console.log('NASA API is Currently Unavailable');
  }
}

// Toggle Heart Color - ONLY WOKRING ON FIRST ITEM IN FAVES <-- FIX THIS!!
function likeColor() {
    resultsArray.forEach((likesUrl) => {
    const likeToggle = document.querySelector('.like-toggle');
    if (likeToggle.classList.contains('far')) {
        likeToggle.classList.remove('far');
        likeToggle.classList.add('fa');
    } else if (likeToggle.classList.contains('fa')) {
        likeToggle.classList.remove('fa');
        likeToggle.classList.add('far');
    }
  });
}

// Like Button - Add to 'likes'
function addLikeFunc(likesUrl) {
    // Loop through Results Array to select Like
    resultsArray.forEach((itemLikes) => {
    if (itemLikes.url.includes(likesUrl) && !likes[likesUrl]) {
        likes[likesUrl] = itemLikes;
        localStorage.setItem('likes', JSON.stringify(likes));
    }  
        likeColor();
    });
}

// Remove item from 'likes'
function removeLike(likesUrl) {
    if (likes[likesUrl]) {
        delete likes[likesUrl];
        //Set Favourites in Local Storage
        localStorage.setItem('likes', JSON.stringify(likes));       
        updateDOMLikes('resultsLikes');
    }
}

// Add Result to Favourites
function saveFavorite(itemUrl) {
    // Loop through Results Array to select Favorite
    resultsArray.forEach((item) => {
        if (item.url.includes(itemUrl) && !favorites[itemUrl]) {
            favorites[itemUrl] = item;
            const starToggle = document.querySelector('.star-toggle')
            starToggle.classList.remove('far');
            starToggle.classList.add('fa');
            // Show Save Confirmation for 2 seconds
            saveConfirmed.hidden = false;
            setTimeout(() => {
                saveConfirmed.hidden = true;
            }, 5000);
            //Set Favourites in Local Storage
            localStorage.setItem('nasaFavorites', JSON.stringify(favorites));
        } 
    });
}

// Remove item from Favourites
function removeFavorite(itemUrl) {
    if (favorites[itemUrl]) {
        delete favorites[itemUrl];
        // Show Delete Confirmation for 2 seconds
        const deleteConfirmed = document.querySelector('.delete-confirmed');
        deleteConfirmed.hidden = false;
        setTimeout(() => {
            deleteConfirmed.hidden = true;
        }, 5000);
        //Set Favourites in Local Storage
        localStorage.setItem('nasaFavorites', JSON.stringify(favorites));
        updateDOM('favorites');
    }
}

// Share button - triggers Web Share API <-- NOT WORKING ON FAVORITES PAGE (wrong Url)
function share() {
    resultsArray.forEach((result) => {
    if (navigator.share) {
        navigator.share({
                title: 'Nasa APOD',
                text: 'I liked this image, I thought you would too',
                url: result.url,
            })
            .then(() => console.log('Successful share'))
            .catch((error) => console.log('Error sharing', error));
    } else {
        alert("Web Share API is not supported in your browser.");
    }
  });
}

// On Load
getNasaPictures();
