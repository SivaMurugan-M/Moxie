// Enable auto-closing details dropdown when clicking outside
document.addEventListener('click', function (e) {
    const details = document.querySelector('.user-menu');
    if (details && details.hasAttribute('open') && !details.contains(e.target)) {
        details.removeAttribute('open');
    }
    const notifDetails = document.querySelector('.notification-menu');
    if (notifDetails && notifDetails.hasAttribute('open') && !notifDetails.contains(e.target)) {
        notifDetails.removeAttribute('open');
    }
});

// Global Admin Search Handler
(function () {
    const searchInput = document.getElementById('admin-search');
    const searchForm = document.getElementById('admin-search-form');
    const searchSubmit = document.getElementById('admin-search-submit');
    const searchDropdown = document.getElementById('admin-search-dropdown');

    if (!searchInput) return;

    // Preserve current search query in input box if 'q' param exists in URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentQ = urlParams.get('q');
    if (currentQ) {
        searchInput.value = currentQ;
    }

    // Quick navigation items map
    const sections = [
        { name: 'Products', url: '/admin/products/', icon: '📦' },
        { name: 'Categories', url: '/admin/categories/', icon: '📂' },
        { name: 'Subcategories', url: '/admin/subcategories/', icon: '📁' },
        { name: 'Banners', url: '/admin/banners/', icon: '🖼️' },
        { name: 'Reviews', url: '/admin/reviews/', icon: '💬' },
        { name: 'Users', url: '/admin/auth/user/?is_staff=1', icon: '👤' },
        { name: 'Customers', url: '/admin/auth/user/', icon: '👥' }
    ];

    function handleSearch(q) {
        const query = (q || '').trim();
        if (!query) return;

        const lowerQ = query.toLowerCase();

        // Direct section keyword match
        if (lowerQ === 'profile' || lowerQ === 'my profile') { window.location.href = '/admin/profile/'; return; }
        if (lowerQ === 'product' || lowerQ === 'products') { window.location.href = '/admin/products/'; return; }
        if (lowerQ === 'category' || lowerQ === 'categories') { window.location.href = '/admin/categories/'; return; }
        if (lowerQ === 'subcategory' || lowerQ === 'subcategories') { window.location.href = '/admin/subcategories/'; return; }
        if (lowerQ === 'banner' || lowerQ === 'banners') { window.location.href = '/admin/banners/'; return; }
        if (lowerQ === 'review' || lowerQ === 'reviews') { window.location.href = '/admin/reviews/'; return; }
        if (lowerQ === 'user' || lowerQ === 'users') { window.location.href = '/admin/auth/user/?is_staff=1'; return; }
        if (lowerQ === 'customer' || lowerQ === 'customers') { window.location.href = '/admin/auth/user/'; return; }

        // If user is currently on a specific admin list page, search within that section
        const path = window.location.pathname;
        if (path.includes('/admin/products/')) {
            window.location.href = '/admin/products/?q=' + encodeURIComponent(query);
        } else if (path.includes('/admin/categories/')) {
            window.location.href = '/admin/categories/?q=' + encodeURIComponent(query);
        } else if (path.includes('/admin/subcategories/')) {
            window.location.href = '/admin/subcategories/?q=' + encodeURIComponent(query);
        } else if (path.includes('/admin/banners/')) {
            window.location.href = '/admin/banners/?q=' + encodeURIComponent(query);
        } else if (path.includes('/admin/reviews/')) {
            window.location.href = '/admin/reviews/?q=' + encodeURIComponent(query);
        } else if (path.includes('/admin/auth/user/')) {
            window.location.href = '/admin/auth/user/?q=' + encodeURIComponent(query);
        } else {
            // Default fallback search: Products
            window.location.href = '/admin/products/?q=' + encodeURIComponent(query);
        }
    }

    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handleSearch(searchInput.value);
        });
    }

    if (searchSubmit) {
        searchSubmit.addEventListener('click', function () {
            handleSearch(searchInput.value);
        });
    }

    // Live Interactive Dropdown Preview
    function renderDropdown(q) {
        const query = (q || '').trim();
        if (!searchDropdown) return;

        if (!query) {
            searchDropdown.style.display = 'none';
            searchDropdown.innerHTML = '';
            return;
        }

        let html = '<div style="padding: 8px 14px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f1f5f9; background: #f8fafc; border-radius: 14px 14px 0 0;">Search across sections</div>';

        sections.forEach(function (sec) {
            const searchUrl = sec.url.includes('?') ? sec.url + '&q=' + encodeURIComponent(query) : sec.url + '?q=' + encodeURIComponent(query);
            html += '<a href="' + searchUrl + '" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; color: #1e293b; text-decoration: none; font-size: 13.5px; transition: all 0.15s ease; border-bottom: 1px solid #f8fafc;" onmouseover="this.style.background=\'#f8fafc\'; this.style.color=\'#6366f1\';" onmouseout="this.style.background=\'transparent\'; this.style.color=\'#1e293b\';">';
            html += '<span style="font-size: 15px;">' + sec.icon + '</span>';
            html += '<span style="color: #475569;">Search <strong style="color: #0f172a;">' + sec.name + '</strong> for "<em style="color: #6366f1; font-style: normal; font-weight: 600;">' + query + '</em>"</span>';
            html += '</a>';
        });

        searchDropdown.innerHTML = html;
        searchDropdown.style.display = 'block';
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            renderDropdown(this.value);
        });

        searchInput.addEventListener('focus', function () {
            if (this.value.trim()) renderDropdown(this.value);
        });
    }

    document.addEventListener('click', function (e) {
        if (searchForm && !searchForm.contains(e.target)) {
            if (searchDropdown) searchDropdown.style.display = 'none';
        }
    });

    // Optional Cmd+K / Ctrl+K shortcut to focus search
    document.addEventListener('keydown', function (e) {
        if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    });
})();

// Dynamic Storefront URL resolution (Localhost vs Netlify)
const sfLink = document.getElementById('storefront-link');
if (sfLink) {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    sfLink.href = isLocal ? 'http://localhost:3000' : 'https://moxie-dev.netlify.app';
}

// Sidebar Hamburger Close on ESC
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        document.body.classList.remove('sidebar-open');
    }
});

// Global Notification & Badge Manager
(function () {
    function getCsrfToken() {
        const cookie = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
        if (cookie) return cookie.split('=')[1];
        const input = document.querySelector('input[name="csrfmiddlewaretoken"]');
        if (input) return input.value;
        if (window.DJANGO_CONTEXT && window.DJANGO_CONTEXT.csrfToken) return window.DJANGO_CONTEXT.csrfToken;
        return '';
    }

    window.updateGlobalNotificationBadges = function (count) {
        const headerBadge = document.getElementById('header-notification-badge');
        const sidebarBadge = document.getElementById('messages-sidebar-badge') || document.querySelector('a[href="/admin/messages/"] .badge');

        const num = Math.max(0, parseInt(count, 10) || 0);
        localStorage.setItem('unread_messages_count', num.toString());

        if (num <= 0) {
            if (headerBadge) headerBadge.style.display = 'none';
            if (sidebarBadge) sidebarBadge.style.display = 'none';
        } else {
            if (headerBadge) {
                headerBadge.textContent = num.toString();
                headerBadge.style.display = 'inline-flex';
            }
            if (sidebarBadge) {
                sidebarBadge.textContent = num.toString();
                sidebarBadge.style.display = 'inline-flex';
            }
        }
    };

    function renderHeaderNotifications(notifications) {
        const listContainer = document.getElementById('header-notification-list');
        if (!listContainer) return;

        if (!notifications || notifications.length === 0) {
            listContainer.innerHTML = '<div style="padding: 30px 16px; text-align: center; color: #94a3b8; font-size: 13px;">No notifications found.</div>';
            return;
        }

        let html = '';
        notifications.slice(0, 8).forEach(function (n) {
            const isUnread = !n.is_read;
            const bgStyle = isUnread ? 'background: #f8fafc;' : '';
            const fontStyle = isUnread ? 'font-weight: 700;' : 'font-weight: 600;';
            const dotPill = isUnread ? '<span style="width: 8px; height: 8px; min-width: 8px; min-height: 8px; border-radius: 50%; background: #6657ec; display: inline-block; margin-top: 4px;"></span>' : '';

            html += '<a href="/admin/messages/" class="notification-popover-item ' + (isUnread ? 'unread' : 'read') + '" data-id="' + (n.numeric_id || n.id) + '" style="' + bgStyle + ' border-bottom: 1px solid #f1f5f9; text-decoration: none; display: flex; gap: 12px; padding: 12px 16px; align-items: flex-start; transition: background 0.15s ease;">';
            html += '<div style="width: 32px; height: 32px; min-width: 32px; min-height: 32px; border-radius: 50%; background: ' + (n.sender_color || '#6657ec') + '; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; margin-top: 2px;">' + (n.sender_initial || 'N') + '</div>';
            html += '<div style="flex: 1; min-width: 0;">';
            html += '<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 3px;">';
            html += '<strong style="font-size: 13px; color: #0f172a; ' + fontStyle + ' overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + n.title + '</strong>';
            html += '<span style="font-size: 11px; color: #94a3b8; white-space: nowrap; flex-shrink: 0;">' + (n.time || '') + '</span>';
            html += '</div>';
            html += '<p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">' + n.body + '</p>';
            html += '</div>';
            html += dotPill;
            html += '</a>';
        });

        listContainer.innerHTML = html;

        listContainer.querySelectorAll('.notification-popover-item').forEach(function (item) {
            item.addEventListener('click', function () {
                const notifId = this.getAttribute('data-id');
                if (notifId) {
                    const numericId = String(notifId).replace('notif_', '');
                    fetch('/api/notifications/' + numericId + '/read/', {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': getCsrfToken(),
                            'Content-Type': 'application/json',
                        },
                    }).catch(function () {});
                }
            });
        });
    }

    function fetchHeaderNotifications() {
        fetch('/api/notifications/?category=all')
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (data.notifications) {
                    renderHeaderNotifications(data.notifications);
                    const unread = data.unread_count !== undefined ? data.unread_count : data.notifications.filter(function (m) { return !m.is_read; }).length;
                    window.updateGlobalNotificationBadges(unread);
                }
            })
            .catch(function (err) { console.warn('Failed to fetch header notifications:', err); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fetchHeaderNotifications);
    } else {
        fetchHeaderNotifications();
    }

    setInterval(fetchHeaderNotifications, 10000);

    function initListeners() {
        const notifMenu = document.querySelector('.notification-menu');
        const markReadBtn = document.getElementById('mark-notifications-read-btn');

        if (notifMenu) {
            notifMenu.addEventListener('toggle', function () {
                if (notifMenu.hasAttribute('open')) {
                    fetchHeaderNotifications();
                }
            });
            notifMenu.addEventListener('click', function () {
                fetchHeaderNotifications();
            });
        }

        if (markReadBtn) {
            markReadBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                fetch('/api/notifications/mark-all-read/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCsrfToken(),
                        'Content-Type': 'application/json',
                    },
                }).then(function () {
                    window.updateGlobalNotificationBadges(0);
                    fetchHeaderNotifications();
                }).catch(function (err) {
                    console.warn('Failed to mark all read:', err);
                });
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initListeners);
    } else {
        initListeners();
    }
})();

// Browser Back Button Cache Protection
window.addEventListener('pageshow', function (event) {
    if (event.persisted || (window.performance && window.performance.navigation && window.performance.navigation.type === 2)) {
        window.location.reload();
    }
});

// ==========================================
// Global Logout Confirmation Modal Logic
// ==========================================
(function () {
    let targetLogoutForm = null;

    function getModalElements() {
        return {
            modal: document.getElementById('logout-confirm-modal'),
            closeBtn: document.getElementById('logout-modal-close-btn'),
            cancelBtn: document.getElementById('logout-modal-cancel-btn'),
            confirmBtn: document.getElementById('logout-modal-confirm-btn')
        };
    }

    function openLogoutModal(form) {
        const { modal, cancelBtn } = getModalElements();
        if (!modal) return;

        targetLogoutForm = form;
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Close user dropdown menu if open
        const details = document.querySelector('.user-menu');
        if (details && details.hasAttribute('open')) {
            details.removeAttribute('open');
        }

        // Auto-focus cancel button for safe keyboard navigation
        setTimeout(function () {
            if (cancelBtn) cancelBtn.focus();
        }, 50);
    }

    function closeLogoutModal() {
        const { modal, cancelBtn, confirmBtn } = getModalElements();
        if (!modal) return;

        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        targetLogoutForm = null;

        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Yes, Logout</span>
            `;
        }
        if (cancelBtn) {
            cancelBtn.disabled = false;
        }
    }

    function initLogoutModal() {
        const { modal, closeBtn, cancelBtn, confirmBtn } = getModalElements();
        if (!modal) return;

        // Delegate click for any logout triggers across navbar and sidebar
        document.addEventListener('click', function (e) {
            const trigger = e.target.closest('.trigger-logout-modal, .logout-item, a[href*="logout"], button[type="submit"][class*="logout"]');
            if (trigger) {
                // Check if this trigger is or belongs to an admin logout action
                const form = trigger.closest('form') || document.querySelector('form[action*="logout"]');
                if (form || trigger.getAttribute('href')?.includes('logout')) {
                    e.preventDefault();
                    e.stopPropagation();
                    openLogoutModal(form);
                }
            }
        });

        if (closeBtn) closeBtn.addEventListener('click', closeLogoutModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeLogoutModal);

        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeLogoutModal();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeLogoutModal();
            }
        });

        if (confirmBtn) {
            confirmBtn.addEventListener('click', function () {
                confirmBtn.disabled = true;
                if (cancelBtn) cancelBtn.disabled = true;
                confirmBtn.innerHTML = '<span>Logging out...</span>';

                if (targetLogoutForm) {
                    targetLogoutForm.submit();
                } else {
                    const fallbackForm = document.querySelector('form[action*="logout"]');
                    if (fallbackForm) {
                        fallbackForm.submit();
                    } else {
                        // Create and submit POST form to Django admin logout url
                        const form = document.createElement('form');
                        form.method = 'POST';
                        form.action = '/admin/logout/';
                        const csrfInput = document.createElement('input');
                        csrfInput.type = 'hidden';
                        csrfInput.name = 'csrfmiddlewaretoken';
                        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || (window.DJANGO_CONTEXT && window.DJANGO_CONTEXT.csrfToken) || '';
                        csrfInput.value = csrfToken;
                        form.appendChild(csrfInput);
                        document.body.appendChild(form);
                        form.submit();
                    }
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLogoutModal);
    } else {
        initLogoutModal();
    }
})();

// Global Admin Theme Manager (Light / Dark Mode)
(function () {
    function getStoredTheme() {
        try {
            var saved = localStorage.getItem('moxie-admin-theme');
            if (saved === 'dark' || saved === 'light') return saved;
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        } catch (e) {}
        return 'light';
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        var toggleBtn = document.getElementById('admin-theme-toggle');
        if (toggleBtn) {
            if (theme === 'dark') {
                toggleBtn.setAttribute('title', 'Switch to light mode');
                toggleBtn.setAttribute('aria-label', 'Switch to light mode');
            } else {
                toggleBtn.setAttribute('title', 'Switch to dark mode');
                toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
            }
        }
        window.dispatchEvent(new CustomEvent('admin-theme-changed', { detail: { theme: theme } }));
    }

    function toggleTheme() {
        var current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        var next = current === 'dark' ? 'light' : 'dark';
        try {
            localStorage.setItem('moxie-admin-theme', next);
        } catch (e) {}
        applyTheme(next);
    }

    window.toggleAdminTheme = toggleTheme;
    window.applyAdminTheme = applyTheme;

    // Delegated click listener ensures clicks on SVG/sub-elements are captured reliably
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('#admin-theme-toggle, .theme-toggle-button');
        if (btn) {
            e.preventDefault();
            e.stopPropagation();
            toggleTheme();
        }
    });

    function initTheme() {
        var initialTheme = getStoredTheme();
        applyTheme(initialTheme);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})();

