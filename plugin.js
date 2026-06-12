const PLUGIN_ID = "otakudesu-satrya";
const BASE_URL = "https://otakudesu.blog";

// 1. CAPABILITIES
source.getCapabilities = function() {
    return new ResultCapabilities(["video"], [], []);
};

source.enable = function(conf) {};
source.disable = function() {};

// 2. BERANDA
source.getHome = function() {
    const resp = http.GET(BASE_URL, {});
    const html = typeof resp === 'string' ? resp : resp.body;
    const doc = domParser.parseFromString(html);
    
    const kotakAnime = doc.querySelectorAll("div.detpost"); 
    const results = [];
    
    for (let i = 0; i < kotakAnime.length; i++) {
        const kotak = kotakAnime[i];
        const elJudul = kotak.querySelector("h2.jdlflm");
        const elGambar = kotak.querySelector("img");
        const elLink = kotak.querySelector("a");
        
        if (elJudul && elGambar && elLink) {
            const judul = elJudul.textContent; 
            const gambar = elGambar.getAttribute("src"); 
            const linkNonton = elLink.getAttribute("href");
            
            // FIX BUG #2 CLAUDE: Semua ID harus persis "otakudesu-satrya"
            results.push(new PlatformVideo({
                id: new PlatformID(PLUGIN_ID, linkNonton, PLUGIN_ID),
                name: judul,
                thumbnails: new Thumbnails([new Thumbnail(gambar, 0)]),
                author: new PlatformAuthorLink(new PlatformID(PLUGIN_ID, "author", PLUGIN_ID), "Otakudesu", BASE_URL, "", 0),
                uploadDate: Math.floor(Date.now() / 1000),
                url: linkNonton,
                duration: 1440,
                viewCount: 0,
                isLive: false
            }));
        }
    }
    return new VideoPager(results, false);
};

// 3. PENCARIAN
source.search = function(query, type, order, filters) {
    const searchUrl = BASE_URL + "/?s=" + encodeURIComponent(query) + "&submit=Search";
    const resp = http.GET(searchUrl, {});
    const html = typeof resp === 'string' ? resp : resp.body;
    const doc = domParser.parseFromString(html);
    
    const listSearch = doc.querySelectorAll(".chivsrc li");
    const results = [];
    
    for (let i = 0; i < listSearch.length; i++) {
        const kotak = listSearch[i];
        const elJudul = kotak.querySelector("h2");
        const elGambar = kotak.querySelector("img");
        const elLink = kotak.querySelector("a");
        
        if (elJudul && elGambar && elLink) {
            const linkNonton = elLink.getAttribute("href");
            const judul = elJudul.textContent;
            const gambar = elGambar.getAttribute("src");
            
            results.push(new PlatformVideo({
                id: new PlatformID(PLUGIN_ID, linkNonton, PLUGIN_ID),
                name: judul,
                thumbnails: new Thumbnails([new Thumbnail(gambar, 0)]),
                author: new PlatformAuthorLink(new PlatformID(PLUGIN_ID, "author", PLUGIN_ID), "Otakudesu", BASE_URL, "", 0),
                uploadDate: Math.floor(Date.now() / 1000),
                url: linkNonton,
                duration: 1440,
                viewCount: 0,
                isLive: false
            }));
        }
    }
    return new VideoPager(results, false);
};

// 4. FIX BUG #1 CLAUDE: GATEKEEPER ISVIDEODETAILSURL
source.isVideoDetailsUrl = function(url) {
    // Kalo URL-nya ngandung otakudesu.blog, berarti ini video kita!
    return url.indexOf("otakudesu.blog") !== -1;
};

// 5. DETAIL PLAYER VIDEO (Udah disetujuin Claude konsepnya)
source.getVideoDetails = function(url) {
    try {
        let targetUrl = url;
        let resp = http.GET(targetUrl, {});
        let html = typeof resp === 'string' ? resp : resp.body;
        let doc = domParser.parseFromString(html);

        // Kalo ini series URL, gali cari episode terbaru
        if (targetUrl.indexOf("/anime/") !== -1) {
            const epsLinks = doc.querySelectorAll(".episodelist ul li a");
            if (epsLinks && epsLinks.length > 0) {
                targetUrl = epsLinks[0].getAttribute("href") || targetUrl;
                resp = http.GET(targetUrl, {});
                html = typeof resp === 'string' ? resp : resp.body;
                doc = domParser.parseFromString(html);
            }
        }

        const elJudul = doc.querySelector("h1");
        const judul = elJudul ? elJudul.textContent : "Nonton Anime";

        const elIframe = doc.querySelector(".responsive-embed iframe") || doc.querySelector("iframe");
        const videoSources = [];

        if (elIframe) {
            let iframeLink = elIframe.getAttribute("src") || elIframe.getAttribute("data-src") || "";
            if (iframeLink.indexOf("//") === 0) {
                iframeLink = "https:" + iframeLink;
            }
            if (iframeLink !== "") {
                videoSources.push(new VideoUrlSource({
                    width: 1280, height: 720, container: "mp4", codec: "avc1",
                    name: "Desustream Server", bitrate: 0, duration: 1440, url: iframeLink
                }));
            }
        }

        if (videoSources.length === 0) {
            videoSources.push(new VideoUrlSource({
                width: 1280, height: 720, container: "mp4", codec: "avc1",
                name: "Link Video Dummy", bitrate: 0, duration: 1440, url: targetUrl
            }));
        }

        return new PlatformVideoDetails({
            id: new PlatformID(PLUGIN_ID, url, PLUGIN_ID),
            name: judul,
            thumbnails: new Thumbnails([new Thumbnail("https://otakudesu.blog/wp-content/uploads/2022/01/logo-1.png", 0)]),
            author: new PlatformAuthorLink(new PlatformID(PLUGIN_ID, "author", PLUGIN_ID), "Otakudesu", BASE_URL, "", 0),
            uploadDate: Math.floor(Date.now() / 1000),
            url: url,
            duration: 1440,
            viewCount: 0,
            isLive: false,
            description: "Nonton via Grayjay Oprekan Bro Satrya 🗿",
            video: new UnMuxVideoSourceDescriptor(videoSources, []) 
        });

    } catch (err) {
        return new PlatformVideoDetails({
            id: new PlatformID(PLUGIN_ID, url, PLUGIN_ID),
            name: "ERROR LOG: " + err.toString(),
            thumbnails: new Thumbnails([new Thumbnail("", 0)]),
            author: new PlatformAuthorLink(new PlatformID(PLUGIN_ID, "author", PLUGIN_ID), "Error Log", BASE_URL, "", 0),
            uploadDate: 0,
            url: url,
            duration: 0,
            viewCount: 0,
            isLive: false,
            description: "Error detail: " + err.toString(),
            video: new UnMuxVideoSourceDescriptor([new VideoUrlSource({
                width: 1280, height: 720, container: "mp4", codec: "avc1",
                name: "Error", bitrate: 0, duration: 0, url: url
            })], [])
        });
    }
};

source.getSearchCapabilities = function() { return new ResultCapabilities([], [], []); };
source.searchSuggestions = function(query) { return []; };
source.isChannelUrl = function(url) { return false; };
source.getChannel = function(url) { throw new ScriptException("Not implemented"); };
source.getChannelVideos = function(url, type, order, filters) { return new VideoPager([], false); };
source.getChannelCapabilities = function() { return new ResultCapabilities([], [], []); };
