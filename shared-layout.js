(function () {
    function loadPartial(slotId, partialFile) {
        var slot = document.getElementById(slotId);
        if (!slot) {
            return Promise.resolve();
        }

        return fetch(partialFile)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed to load ' + partialFile);
                }
                return response.text();
            })
            .then(function (html) {
                slot.innerHTML = html;
            })
            .catch(function (error) {
                console.error(error);
            });
    }

    function getCurrentPage() {
        var page = window.location.pathname.split('/').pop();
        return page || 'index.html';
    }

    function activateCurrentNavLink() {
        var page = getCurrentPage();
        var desktopLinks = Array.prototype.slice.call(document.querySelectorAll('header nav a[href$=".html"]'));
        var mobileLinks = Array.prototype.slice.call(document.querySelectorAll('#mobile-menu a[href$=".html"]'));

        function setActive(link) {
            link.classList.remove('text-slate-600', 'dark:text-slate-400', 'text-slate-700');
            link.classList.add('text-primary');
            if (link.closest('nav')) {
                link.classList.add('border-b-2', 'border-primary', 'pb-1');
            }
        }

        desktopLinks.forEach(function (link) {
            var href = link.getAttribute('href');
            if (href === page || (page === 'index.html' && href === 'index.html')) {
                setActive(link);
            }
        });

        mobileLinks.forEach(function (link) {
            var href = link.getAttribute('href');
            if (href === page || (page === 'index.html' && href === 'index.html')) {
                setActive(link);
            }
        });
    }

    function initMobileMenu() {
        var menuButton = document.querySelector('[data-mobile-menu-button]');
        var menuIcon = document.querySelector('[data-menu-icon]');
        var mobileMenu = document.getElementById('mobile-menu');
        var mobileBackdrop = document.querySelector('[data-mobile-menu-backdrop]');
        var mobilePanel = document.querySelector('[data-mobile-menu-panel]');
        var closeButton = document.querySelector('[data-mobile-menu-close]');

        if (!menuButton || !menuIcon || !mobileMenu || !mobileBackdrop || !mobilePanel) {
            return;
        }

        function openMenu() {
            mobileMenu.classList.remove('pointer-events-none');
            mobileMenu.setAttribute('aria-hidden', 'false');
            mobileBackdrop.style.opacity = '1';
            mobilePanel.style.transform = 'translateX(0)';
            menuButton.setAttribute('aria-expanded', 'true');
            menuIcon.textContent = 'close';
            document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
            mobileBackdrop.style.opacity = '0';
            mobilePanel.style.transform = 'translateX(-100%)';
            mobileMenu.classList.add('pointer-events-none');
            mobileMenu.setAttribute('aria-hidden', 'true');
            menuButton.setAttribute('aria-expanded', 'false');
            menuIcon.textContent = 'menu';
            document.body.style.overflow = '';
        }

        function toggleMenu() {
            if (menuButton.getAttribute('aria-expanded') === 'true') {
                closeMenu();
            } else {
                openMenu();
            }
        }

        menuButton.addEventListener('click', function (event) {
            event.stopPropagation();
            toggleMenu();
        });

        if (closeButton) {
            closeButton.addEventListener('click', function () {
                closeMenu();
            });
        }

        mobileMenu.addEventListener('click', function (event) {
            if (event.target && event.target.tagName === 'A') {
                closeMenu();
            }
        });

        mobileBackdrop.addEventListener('click', function () {
            closeMenu();
        });

        document.addEventListener('click', function (event) {
            if (window.innerWidth < 768 && !mobileMenu.contains(event.target) && !menuButton.contains(event.target)) {
                closeMenu();
            }
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth >= 768) {
                closeMenu();
                mobileBackdrop.style.opacity = '';
                mobilePanel.style.transform = '';
            }
        });

        closeMenu();
    }

    function handleIndexOnlyContactLinks() {
        var page = getCurrentPage();
        if (page === 'index.html') {
            return;
        }

        var indexOnlyLinks = Array.prototype.slice.call(document.querySelectorAll('[data-index-only-contact]'));
        indexOnlyLinks.forEach(function (link) {
            link.remove();
        });
    }

    Promise.all([
        loadPartial('navbar-slot', 'navbar.html'),
        loadPartial('footer-slot', 'footer.html')
    ]).then(function () {
        handleIndexOnlyContactLinks();
        activateCurrentNavLink();
        initMobileMenu();
        document.dispatchEvent(new CustomEvent('shared-layout:ready'));
    });
})();
