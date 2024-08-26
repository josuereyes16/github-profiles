const APIURL = 'https://api.github.com/users/';

const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');

async function getUser(username) {
    try {
        const { data } = await axios(APIURL + username);
        createUserCard(data);
        getRepos(username);
    } catch (err) {
        handleApiError(err);
    }
}

async function getRepos(username) {
    try {
        const { data } = await axios(APIURL + username + '/repos?sort=created');
        addReposToCard(data);
    } catch (err) {
        handleApiError(err);
    }
}

function createUserCard(user) {
    const userID = user.name || user.login;
    const userBio = user.bio ? `<p>${user.bio}</p>` : '';
    const cardHTML = `
        <div class="card">
            <div>
                <img src="${user.avatar_url}" alt="${user.name}" class="avatar">
            </div>
            <div class="user-info">
                <h2>${userID}</h2>
                ${userBio}
                <ul>
                    <li>${user.followers} <strong>Followers</strong></li>
                    <li>${user.following} <strong>Following</strong></li>
                    <li>${user.public_repos} <strong>Repos</strong></li>
                </ul>
                <div id="repos"></div>
            </div>
        </div>
    `;
    main.innerHTML = cardHTML;
}

function createErrorCard(msg) {
    const cardHTML = `
        <div class="card">
            <h1>${msg}</h1>
        </div>
    `;
    main.innerHTML = cardHTML;
}

function addReposToCard(repos) {
    const reposEl = document.getElementById('repos');

    repos.slice(0, 5).forEach(repo => {
        const repoEl = document.createElement('a');
        repoEl.classList.add('repo');
        repoEl.href = repo.html_url;
        repoEl.target = '_blank';
        repoEl.innerText = repo.name;
        reposEl.appendChild(repoEl);
    });
}

function handleApiError(err) {
    if (err.response) {
        // API responded with an error status code
        if (err.response.status === 404) {
            createErrorCard('No profile with this username');
        } else if (err.response.status === 403) {
            createErrorCard('API rate limit exceeded. Please wait and try again later.');
        } else if (err.response.status === 500) {
            createErrorCard('Server error. Please try again later.');
        } else {
            createErrorCard('An error occurred: ' + err.response.statusText);
        }
    } else if (err.request) {
        // No response received
        createErrorCard('No response received from the API');
    } else {
        // Error in setting up the request
        createErrorCard('Error in request setup: ' + err.message);
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const user = search.value;

    if (user) {
        getUser(user);
        search.value = '';
    }
});
