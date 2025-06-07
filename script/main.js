document.addEventListener('DOMContentLoaded', () => {
    const dynamicContent = document.getElementById('dynamic-content');
    const menuLinks = document.querySelectorAll('.menu a');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    let currentCategoryData = [];
    let currentPageName = '';

    async function loadPageContent(pageName) {
        currentPageName = pageName;
        let contentHtml = '';
        let data = [];

        searchInput.value = '';

        menuLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.menu a[data-page="${pageName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        dynamicContent.className = '';
        dynamicContent.id = 'dynamic-content';
        dynamicContent.classList.add(`content-${pageName}`);

        switch (pageName) {
            case 'apks':
            case 'programas':
            case 'books':
                data = await fetchConfigData(pageName);
                currentCategoryData = data;
                const title = pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/s$/, 's');
                contentHtml = `<h2>${title}</h2><div class="category-grid"></div>`;
                dynamicContent.innerHTML = contentHtml;
                renderCategoryItems(dynamicContent.querySelector('.category-grid'), currentCategoryData);
                break;
            case 'explore':
                currentCategoryData = [];
                contentHtml = '<h2>Explore</h2><p>Descubra novas coisas!</p>';
                dynamicContent.innerHTML = contentHtml;
                break;
            case 'informacoes':
                currentCategoryData = [];
                contentHtml = '<h2>Informações</h2><p>Esse site foi feito para ser totalmente grátis!</p>';
                dynamicContent.innerHTML = contentHtml;
                break;
            case 'settings':
                currentCategoryData = [];
                contentHtml = '<h2>Configurações</h2><p>Ajuste suas preferências aqui.</p>';
                dynamicContent.innerHTML = contentHtml;
                break;
            default:
                currentCategoryData = [];
                contentHtml = '<h2>Página Não Encontrada</h2><p>O conteúdo que você procura não está disponível.</p>';
                dynamicContent.innerHTML = contentHtml;
        }
    }

    async function fetchConfigData(category) {
        try {
            const response = await fetch(`config/${category}.json`);
            if (!response.ok) {
                console.warn(`Arquivo config/${category}.json não encontrado ou erro ao carregar. Retornando array vazio.`);
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error(`Erro ao buscar dados de ${category}:`, error);
            return [];
        }
    }

    function renderCategoryItems(container, items) {
        container.innerHTML = '';
        if (items.length === 0) {
            container.innerHTML = '<p class="no-results">Nenhum item encontrado nesta categoria que corresponda à sua pesquisa.</p>';
            return;
        }
        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('category-item');
            itemDiv.innerHTML = `
                <img src="${item.foto}" alt="${item.nome}">
                <h3>${item.nome}</h3>
                <a href="${item.link}" target="_blank" class="download-link">Download</a>
            `;
            container.appendChild(itemDiv);
        });
    }

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let filteredItems = [];

        if (['apks', 'programas', 'books'].includes(currentPageName) && currentCategoryData.length > 0) {
            filteredItems = currentCategoryData.filter(item => {
                return item.nome.toLowerCase().includes(searchTerm);
            });
            const categoryGrid = dynamicContent.querySelector('.category-grid');
            if (categoryGrid) {
                renderCategoryItems(categoryGrid, filteredItems);
            }
        } else if (searchTerm !== '') {
            dynamicContent.innerHTML = `<h2>Pesquisa</h2><p class="no-results">A pesquisa não está disponível ou não há itens para pesquisar nesta página.</p>`;
        }
    }

    searchButton.addEventListener('click', performSearch);

    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter' || searchInput.value.trim() === '') {
            performSearch();
        }
    });

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = e.currentTarget.dataset.page;
            loadPageContent(pageName);
            window.history.pushState({ page: pageName }, '', `/${pageName}`);
        });
    });

    const initialPage = window.location.pathname.split('/').pop();
    if (initialPage && initialPage !== '') {
        loadPageContent(initialPage);
    } else {
        loadPageContent('explore');
    }

    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.page) {
            loadPageContent(event.state.page);
        } else {
            loadPageContent('explore');
        }
    });
});