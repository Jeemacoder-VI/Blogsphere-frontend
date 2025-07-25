const articles = [
    {
        title: "UX review presentations",
        cover: "assets/uxbg.jpg",
        tag: "Design",
        desc: "Comment créer des présentations qui impressionnent vos collègues et managers ?",
        author: "Olivia Rhye",
        avatar: "assets/image.png",
        date: "20 Jan 2022",
        link: "article.html"
    },
    {
        title: "Les tendances du web design en 2025",
        cover: "assets/webdesign2025.jpg",
        tag: "Web",
        desc: "Découvrez les nouveautés et les bonnes pratiques pour un site moderne.",
        author: "John Doe",
        avatar: "assets/image.png",
        date: "15 Juin 2025",
        link: "article.html"
    },
    {
        title: "Guide complet du CSS moderne",
        cover: "assets/cssmoderne.jpg",
        tag: "CSS",
        desc: "Maîtrisez les dernières fonctionnalités du CSS pour des interfaces élégantes.",
        author: "Jane Smith",
        avatar: "assets/image.png",
        date: "10 Mai 2025",
        link: "article.html"
    },
    {
        title: "Créer un blog moderne avec JavaScript",
        cover: "assets/javasciptbg.jpg",
        tag: "JavaScript",
        desc: "Un guide étape par étape pour construire un blog interactif.",
        author: "Alex Martin",
        avatar: "assets/image.png",
        date: "02 Avril 2025",
        link: "article.html"
    },
    {
        title: "Trouver l'inspiration pour vos projets web",
        cover: "assets/inspirationnal.jpg",
        tag: "Inspiration",
        desc: "Des idées et des ressources pour booster votre créativité.",
        author: "Sophie Lemaire",
        avatar: "assets/image.png",
        date: "28 Mars 2025",
        link: "article.html"
    }
];

const users = [
    {
        name: "Olivia Rhye",
        avatar: "assets/soda-profile.png",
        bio: "Passionnée de blogging, d’agriculture et de technologie 💻🌱",
        articles: [
            { title: "🖥️ Création d’une interface responsive moderne en 2025", link: "article1.html" },
            { title: "💻 Ce que j’ai appris en lançant un blog technique", link: "article2.html" },
            { title: "📈 Optimiser l’eau pour des rendements durables", link: "article3.html" }
        ]
    }
    // Ajoute d'autres utilisateurs ici
];

function renderArticles(filterTag = "all", search = "") {
    const grid = document.getElementById("articlesGrid");
    grid.innerHTML = "";
    let filtered = articles.filter(a => {
        const tagMatch = filterTag === "all" || a.tag === filterTag;
        const searchMatch = a.title.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase());
        return tagMatch && searchMatch;
    });
    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#6B6B6B;">Aucun article trouvé.</p>';
        return;
    }
    filtered.forEach(a => {
        grid.innerHTML += `
        <article class="article-card">
            <img src="${a.cover}" alt="Image de couverture" class="card-cover">
            <div class="card-content">
                <span class="card-tag">${a.tag}</span>
                <h3 class="card-title"><a href="${a.link}">${a.title}</a></h3>
                <p class="card-desc">${a.desc}</p>
                <div class="card-meta">
                    <img src="${a.avatar}" alt="Avatar" class="card-avatar">
                    <span class="card-author">${a.author}</span>
                    <span class="card-date">${a.date}</span>
                </div>
            </div>
        </article>
        `;
    });
}

// Initialisation
let currentTag = "all";
let currentSearch = "";
renderArticles();

// Gestion des tags
const tags = document.querySelectorAll(".tags-filter .tag");
tags.forEach(tag => {
    tag.addEventListener("click", function () {
        tags.forEach(t => t.classList.remove("active"));
        this.classList.add("active");
        currentTag = this.dataset.tag;
        renderArticles(currentTag, currentSearch);
    });
});

// Gestion de la recherche
const searchForm = document.querySelector(".search-bar");
const searchInput = document.getElementById("searchInput");
searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    currentSearch = searchInput.value;
    renderArticles(currentTag, currentSearch);
});
searchInput.addEventListener("input", function () {
    currentSearch = this.value;
    renderArticles(currentTag, currentSearch);
});

// Fonction pour obtenir le profil public d'un utilisateur et ses articles
function getUserProfile(authorName) {
    const userArticles = articles.filter(a => a.author === authorName);
    if (userArticles.length === 0) return null;
    const { author, avatar } = userArticles[0];
    return {
        name: author,
        avatar: avatar,
        bio: "Blogueuse passionnée.", // Personnalise la bio si besoin
        articles: userArticles.map(a => ({
            title: a.title,
            link: a.link
        })),
        profileLink: authorName === "Olivia Rhye" ? "userprofile.html" : "#"
    };
}
