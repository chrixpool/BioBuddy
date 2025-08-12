document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const emailjsConfig = {
        publicKey: "YOUR_PUBLIC_KEY",
        serviceID: "YOUR_SERVICE_ID",
        templateID: "YOUR_TEMPLATE_ID"
    };
    
    const library = {
        instagram: {
            bio: {
                casual: { patterns: ["Living for {keyword1}. ✨ Fueled by coffee and {keyword2}.", "Just a human obsessed with {keyword1} and {keyword2}.", "My world: {keyword1}, {keyword2}, and good vibes only. ✌️", "On a quest for the best {keyword1}. Join my adventure!"], emojis: ["🌿", "💖", "☀️", "📍"], hashtags: ["#{keyword1}life", "#{keyword2}lover", "#goodvibes", "#instadaily"] },
                professional: { patterns: ["Sharing my professional journey in {keyword1} & {keyword2}.", "Content creator focused on {keyword1}, with expertise in {keyword2}.", "Helping brands grow through {keyword1} and digital strategy.", "Exploring the intersection of {keyword1} and {keyword2}."], emojis: ["📈", "💡", "🚀", "💼"], hashtags: ["#{keyword1}", "#{keyword2}", "#business", "#expert"] },
                funny: { patterns: ["My personality is 50% {keyword1} and 50% {keyword2}. 🤪", "Powered by an unhealthy obsession with {keyword1} and tacos.", "I'm not a regular mom, I'm a {keyword1}-loving mom who also enjoys {keyword2}.", "Warning: may spontaneously start talking about {keyword1}."], emojis: ["😂", "🌮", "🤷‍♀️", "✨"], hashtags: ["#{keyword1}addict", "#funnybio", "#realtalk"] },
                inspirational: { patterns: ["Creating a life I love, fueled by {keyword1} and {keyword2}.", "On a mission to make the world better through {keyword1}.", "Dreaming big and finding inspiration in {keyword1}."], emojis: ["💫", "💖", "🙏", "🌟"], hashtags: ["#{keyword1}journey", "#inspiration", "#motivation", "#dreambig"] }
            },
            caption: {
                casual: { patterns: ["All about the {keyword1} vibes today.", "{keyword1} and {keyword2}: a perfect match.", "Couldn't resist sharing this {keyword1} moment."], emojis: ["📸", "🙌", "💯"], hashtags: ["#{keyword1}", "#{keyword2}gram", "#moments"] },
                funny: { patterns: ["They said 'act natural'. So I did my {keyword1} thing.", "Is it a {keyword1} day or a {keyword2} day? Why not both?"], emojis: ["😜", "😎"], hashtags: ["#{keyword1}chronicles", "#captionthis"] }
            }
        },
        linkedin: {
            bio: {
                professional: { patterns: ["Results-driven professional specializing in {keyword1} and {keyword2}.", "Innovative problem-solver with a passion for {keyword1} and scalable solutions.", "Seeking new opportunities to drive growth in the {keyword1} sector.", "Expert in {keyword1} with a proven track record in {keyword2}."], emojis: [], hashtags: [] },
                casual: { patterns: ["Passionate about the intersection of technology and {keyword1}.", "Exploring new trends in {keyword1} and {keyword2}.", "Let's connect and talk about {keyword1}!"], emojis: [], hashtags: [] }
            }
        },
        tinder: {
            bio: {
                funny: { patterns: ["My two favorite things are {keyword1} and {keyword2}. And maybe you. 😉", "Looking for someone who can talk about {keyword1} for hours. I'll bring the snacks.", "Must love dogs and have a tolerance for my {keyword1} obsession."], emojis: ["🍟", "🍻", "🐶", "😂"], hashtags: [] },
                casual: { patterns: ["Seeking adventures, good conversations, and someone who also likes {keyword1}.", "Let's find a new {keyword1} spot together, or just chill with some {keyword2}.", "Looking for my partner in crime for {keyword1} and beyond."], emojis: ["😊", "🌲", "✈️", "🌊"], hashtags: [] }
            }
        },
        general: {
            caption: {
                casual: { patterns: ["All about that {keyword1} life.", "Just enjoying some {keyword1} and {keyword2}."], emojis: ["👍", "😊"], hashtags: [] }
            }
        }
    };
    
    const platformLimits = { instagram: { bio: 150, caption: 2200 }, linkedin: { headline: 220, bio: 2600 }, tinder: { bio: 500 } };

    // --- DOM ELEMENTS CACHE ---
    const dom = {
        platformSelect: document.getElementById('platform'),
        contentTypeSelect: document.getElementById('contentType'),
        toneSelect: document.getElementById('tone'),
        keywordInput: document.getElementById('keyword-input'),
        generateBtn: document.getElementById('generate-btn'),
        previewBox: document.getElementById('preview-box'),
        copyBtn: document.getElementById('copy-btn'),
        saveBtn: document.getElementById('save-btn'),
        favoritesList: document.getElementById('favorites-list'),
        noFavoritesMsg: document.getElementById('no-favorites'),
        messageBox: document.getElementById('message-box'),
        contactForm: document.getElementById('contact-form'),
        contactSubmitBtn: document.getElementById('contact-submit-btn'),
        contactMessageBox: document.getElementById('contact-message-box'),
        pageContents: document.querySelectorAll('.page-content'),
        nav: document.querySelector('nav'),
        platformPreviews: document.querySelectorAll('.platform-preview')
    };

    // --- FUNCTIONS ---
    function showPage(pageId) {
        dom.pageContents.forEach(page => page.classList.add('hidden'));
        const targetPage = document.getElementById(`page-${pageId}`);
        if (targetPage) targetPage.classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === pageId) link.classList.add('active');
        });
    }
    
    function populateDropdown(selectElement, options) {
        if (selectElement) {
            selectElement.innerHTML = options.map(opt => `<option value="${opt}">${opt.charAt(0).toUpperCase() + opt.slice(1)}</option>`).join('');
        }
    }

    function updateDropdowns() {
        const platform = dom.platformSelect.value;
        const platformLib = library[platform] || {};
        
        const contentTypes = Object.keys(platformLib);
        populateDropdown(dom.contentTypeSelect, contentTypes);

        const contentType = dom.contentTypeSelect.value;
        const tones = (platformLib[contentType] && Object.keys(platformLib[contentType])) || [];
        populateDropdown(dom.toneSelect, tones);
    }
    
    function updatePlatformPreview() {
        const platform = dom.platformSelect.value;
        dom.platformPreviews.forEach(p => p.classList.add('hidden'));
        let previewToShow = document.getElementById(`preview-${platform}`);
        if (!previewToShow) {
            previewToShow = document.getElementById('preview-general');
        }
        previewToShow.classList.remove('hidden');
    }

    function getRandomElement(arr) {
        if (!arr || arr.length === 0) return "";
        return arr[Math.floor(Math.random() * arr.length)];
    }
    
    function generateCreativeText() {
        const platform = dom.platformSelect.value;
        const contentType = dom.contentTypeSelect.value;
        const tone = dom.toneSelect.value;
        
        let allKeywords = [];
        if (dom.keywordInput?.value) {
            allKeywords = dom.keywordInput.value.replace(/,/g, ' ').split(' ').map(k => k.trim()).filter(k => k.length > 0);
        }
        if (allKeywords.length === 0) allKeywords.push("life");

        let lib = library[platform]?.[contentType]?.[tone];
        if (!lib) {
            dom.previewBox.value = "No creative formulas available for this selection. Please try another.";
            return;
        }

        const keyword1 = getRandomElement(allKeywords);
        let keyword2 = getRandomElement(allKeywords.filter(k => k !== keyword1)) || "good vibes";

        let pattern = getRandomElement(lib.patterns);
        let text = pattern.replace(/{keyword1}/g, keyword1).replace(/{keyword2}/g, keyword2);

        const emoji = getRandomElement(lib.emojis);
        if (emoji) text += ` ${emoji}`;

        if ((platform === 'instagram' || platform === 'tiktok') && lib.hashtags) {
            let generatedHashtags = new Set();
            allKeywords.slice(0, 2).forEach(kw => generatedHashtags.add(`#${kw.replace(/\s+/g, '')}`));
            if (lib.hashtags.length > 0) generatedHashtags.add(getRandomElement(lib.hashtags));
            if (generatedHashtags.size > 0) text += `\n\n${[...generatedHashtags].join(' ')}`;
        }

        const limit = platformLimits[platform]?.[contentType];
        if (limit && text.length > limit) text = text.substring(0, limit);

        dom.previewBox.value = text;
        const previewTextElement = document.getElementById(`preview-${platform}-text`) || document.getElementById('preview-general-text');
        if (previewTextElement) {
            previewTextElement.innerText = text;
        }
        
        dom.copyBtn.disabled = false;
        dom.saveBtn.disabled = false;
    }

    function copyText() {
        if (!dom.previewBox.value) return;
        const textarea = document.createElement('textarea');
        textarea.value = dom.previewBox.value;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showMessage(dom.messageBox, 'Copied to clipboard!', 'success');
        } catch (err) { console.error('Failed to copy text: ', err); }
        document.body.removeChild(textarea);
    }
    
    function showMessage(element, text, type = 'success', persistent = false) {
        element.textContent = text;
        element.className = `mt-4 p-3 text-center rounded-lg text-sm transition-opacity duration-300 opacity-100 ${ type === 'success' ? 'bg-green-100 text-green-800' : type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800' }`;
        if (!persistent) {
            setTimeout(() => { element.classList.add('opacity-0'); }, 4000);
        }
    }

    function saveFavorite() {
        const text = dom.previewBox.value;
        if (!text) return;
        const favorites = getFavorites();
        if (!favorites.includes(text)) {
            favorites.unshift(text);
            localStorage.setItem('bioBuddyFavorites', JSON.stringify(favorites));
            renderFavorites();
            showMessage(dom.messageBox, 'Saved to favorites!', 'info');
        } else { showMessage(dom.messageBox, 'Already in favorites.', 'info'); }
    }

    function getFavorites() { return JSON.parse(localStorage.getItem('bioBuddyFavorites')) || []; }
    
    function renderFavorites() {
        if (!dom.favoritesList) return;
        const favorites = getFavorites();
        dom.favoritesList.innerHTML = '';
        if (favorites.length === 0) {
            dom.noFavoritesMsg.style.display = 'block';
            dom.favoritesList.style.display = 'none';
        } else {
            dom.noFavoritesMsg.style.display = 'none';
            dom.favoritesList.style.display = 'block';
            favorites.forEach((fav, index) => {
                const item = document.createElement('div');
                item.className = 'favorite-item flex items-center justify-between bg-white/80 p-4 rounded-lg shadow-md fade-in';
                
                const textPara = document.createElement('p');
                textPara.className = 'text-gray-700 flex-1 mr-4 whitespace-pre-wrap';
                textPara.innerText = fav;

                const deleteBtn = document.createElement('button');
                deleteBtn.setAttribute('aria-label', 'Delete favorite');
                deleteBtn.dataset.index = index;
                deleteBtn.className = 'delete-fav-btn flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition';
                deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`;
                
                item.appendChild(textPara);
                item.appendChild(deleteBtn);
                dom.favoritesList.appendChild(item);
            });
        }
    }

    function deleteFavorite(indexStr) {
        const index = parseInt(indexStr, 10);
        if (isNaN(index)) {
            console.error("Invalid index for deleteFavorite:", indexStr);
            return;
        }
        let favorites = getFavorites();
        if (index >= 0 && index < favorites.length) {
            favorites.splice(index, 1);
            localStorage.setItem('bioBuddyFavorites', JSON.stringify(favorites));
            renderFavorites();
        } else {
            console.error("Index out of bounds for deleteFavorite:", index);
        }
    }
    
    function setupEventListeners() {
        dom.nav.addEventListener('click', (e) => {
            const targetLink = e.target.closest('.nav-link');
            if (targetLink?.dataset.page) {
                e.preventDefault();
                showPage(targetLink.dataset.page);
            }
        });

        if (dom.generateBtn) dom.generateBtn.addEventListener('click', generateCreativeText);
        if (dom.copyBtn) dom.copyBtn.addEventListener('click', copyText);
        if (dom.saveBtn) dom.saveBtn.addEventListener('click', saveFavorite);
        if (dom.platformSelect) dom.platformSelect.addEventListener('change', () => {
            updateDropdowns();
            updatePlatformPreview();
        });
        if (dom.contentTypeSelect) dom.contentTypeSelect.addEventListener('change', updateDropdowns);
        
        if (dom.favoritesList) {
            dom.favoritesList.addEventListener('click', (e) => {
                const deleteBtn = e.target.closest('.delete-fav-btn');
                if (deleteBtn) deleteFavorite(deleteBtn.dataset.index);
            });
        }

        if (dom.contactForm) {
            dom.contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                dom.contactSubmitBtn.disabled = true;
                dom.contactSubmitBtn.textContent = 'Sending...';

                emailjs.sendForm(emailjsConfig.serviceID, emailjsConfig.templateID, this)
                    .then(() => {
                        showMessage(dom.contactMessageBox, "Thanks for your message! We'll get back to you soon.", 'success', true);
                        dom.contactForm.reset();
                    }, (err) => {
                        showMessage(dom.contactMessageBox, `Failed to send message. Error: ${err.text || JSON.stringify(err)}`, 'error', true);
                    })
                    .finally(() => {
                        dom.contactSubmitBtn.disabled = false;
                        dom.contactSubmitBtn.textContent = 'Send Message';
                    });
            });
        }
    }

    // --- INITIALIZATION ---
    function init() {
        if (emailjsConfig.publicKey !== "YOUR_PUBLIC_KEY") {
            emailjs.init({ publicKey: emailjsConfig.publicKey });
        }
        setupEventListeners();
        showPage('home');
        if (dom.platformSelect) {
            populateDropdown(dom.platformSelect, Object.keys(library));
            updateDropdowns();
            updatePlatformPreview();
        }
        renderFavorites();
    }

    init();
});

// assets/js/main.js (or script.js)
async function callGPT(prompt) {
  const res = await fetch('/api/gpt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  const json = await res.json();
  return json.text || '';
}

document.getElementById('generate-btn').addEventListener('click', async () => {
  const prompt = document.getElementById('keyword-input').value || "generate a short instagram bio";
  const result = await callGPT(prompt);
  // show result in preview and textarea
  document.getElementById('preview-box').value = result;
  document.getElementById('preview-general-text').innerText = result;
});

