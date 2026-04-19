(function () {
    function loadStylesheet(href) {
        return new Promise(function (resolve, reject) {
            var existing = document.querySelector('link[href="' + href + '"]');
            if (existing) {
                resolve();
                return;
            }

            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = function () {
                resolve();
            };
            link.onerror = function () {
                reject(new Error('Failed to load ' + href));
            };
            document.head.appendChild(link);
        });
    }

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            if (window.AOS) {
                resolve();
                return;
            }

            var existing = document.querySelector('script[src="' + src + '"]');
            if (existing) {
                existing.addEventListener('load', function () {
                    resolve();
                });
                existing.addEventListener('error', function () {
                    reject(new Error('Failed to load ' + src));
                });
                return;
            }

            var script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = function () {
                resolve();
            };
            script.onerror = function () {
                reject(new Error('Failed to load ' + src));
            };
            document.head.appendChild(script);
        });
    }

    function initAOS() {
        loadStylesheet('https://unpkg.com/aos@2.3.4/dist/aos.css')
            .then(function () {
                return loadScript('https://unpkg.com/aos@2.3.4/dist/aos.js');
            })
            .then(function () {
                if (window.AOS) {
                    window.AOS.init({
                        duration: 800,
                        easing: 'ease-out-cubic',
                        once: true,
                        offset: 90
                    });
                }
            })
            .catch(function (error) {
                console.error(error);
            });
    }

    function applyTextAnimations() {
        var main = document.querySelector('main');
        if (!main) {
            return;
        }

        var selectors = [
            'h1',
            'h2',
            'h3',
            'h4',
            'p',
            'li',
            'summary',
            'label'
        ].join(',');
        var items = Array.prototype.slice.call(main.querySelectorAll(selectors));
        var animationIndex = 0;

        items.forEach(function (element) {
            if (element.closest('nav') || element.closest('footer') || element.closest('#mobile-menu')) {
                return;
            }

            if (element.closest('[data-no-aos]')) {
                return;
            }

            if (element.hasAttribute('data-aos')) {
                return;
            }

            if (element.textContent && element.textContent.trim().length === 0) {
                return;
            }

            var direction = animationIndex % 2 === 0 ? 'fade-right' : 'fade-left';
            element.setAttribute('data-aos', direction);
            element.setAttribute('data-aos-delay', String((animationIndex % 4) * 80));
            animationIndex += 1;
        });

        if (window.AOS) {
            window.AOS.refreshHard();
        }
    }

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

    function syncNavbarOffsets() {
        var strip = document.querySelector('.nav-gradient-bg');
        var header = document.querySelector('header');
        var mobileMenu = document.getElementById('mobile-menu');

        if (!header) {
            return;
        }

        var stripHeight = strip ? Math.ceil(strip.getBoundingClientRect().height) : 0;
        header.style.top = stripHeight + 'px';

        if (mobileMenu) {
            mobileMenu.style.top = stripHeight + 'px';
        }
    }

    function syncMainOffset() {
        var main = document.querySelector('main');
        var strip = document.querySelector('.nav-gradient-bg');
        var header = document.querySelector('header');

        if (!main || !header) {
            return;
        }

        // Use explicit strip + header heights to avoid transient gaps while fonts/layout settle.
        var stripHeight = strip ? Math.ceil(strip.getBoundingClientRect().height) : 0;
        var headerHeight = Math.ceil(header.getBoundingClientRect().height);
        var offset = stripHeight + headerHeight;
        main.style.paddingTop = offset + 'px';
        main.style.marginTop = '0';
    }

    function syncLayoutOffsets() {
        syncNavbarOffsets();
        syncMainOffset();
    }

    function syncLayoutOffsetsAfterRender() {
        syncLayoutOffsets();
        window.requestAnimationFrame(function () {
            syncLayoutOffsets();
        });
    }

    Promise.all([
        loadPartial('navbar-slot', 'navbar.html'),
        loadPartial('footer-slot', 'footer.html')
    ]).then(function () {
        initAOS();
        activateCurrentNavLink();
        initMobileMenu();
        syncLayoutOffsetsAfterRender();
        applyTextAnimations();
        window.addEventListener('resize', function () {
            syncLayoutOffsetsAfterRender();
        });
        window.addEventListener('load', syncLayoutOffsetsAfterRender);

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(syncLayoutOffsetsAfterRender);
        }

        document.dispatchEvent(new CustomEvent('shared-layout:ready'));
    });
})();
