const PLUGIN_ID = "otakudesu-satrya";
const BASE_URL = "https://otakudesu.blog";

source.enable = function(conf) {};
source.disable = function() {};

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
            
            // platform name disamain ama nama config lu
            results.push(new PlatformVideo({
                id: new PlatformID("Otakudesu Stream", linkNonton, PLUGIN_ID),
                name: judul,
                thumbnails: new Thumbnails([new Thumbnail(gambar, 0)]),
                author: new PlatformAuthorLink(new PlatformID("Otakudesu Stream", "author", PLUGIN_ID), "Otakudesu", BASE_URL, "", 0),
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
                id: new PlatformID("Otakudesu Stream", linkNonton, PLUGIN_ID),
                name: judul,
                thumbnails: new Thumbnails([new Thumbnail(gambar, 0)]),
                author: new PlatformAuthorLink(new PlatformID("Otakudesu Stream", "author", PLUGIN_ID), "Otakudesu", BASE_URL, "", 0),
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

source.isVideoDetailsUrl = function(url) {
    return url.indexOf("otakudesu") !== -1;
};

source.getVideoDetails = function(url) {
    let targetUrl = url;
    let resp = http.GET(targetUrl, {});
    let html = typeof resp === 'string' ? resp : resp.body;
    let doc = domParser.parseFromString(html);

    // script otomatis gali link episode kalo user ngeklik halaman anime
    if (targetUrl.indexOf("/anime/") !== -1) {
        const epsLinks = doc.querySelectorAll(".episodelist ul li a");
        if (epsLinks.length > 0) {
            // ambil episode terbaru
            targetUrl = epsLinks[0].getAttribute("href");
            resp = http.GET(targetUrl, {});
            html = typeof resp === 'string' ? resp : resp.body;
            doc = domParser.parseFromString(html);
        }
    }

    const elJudul = doc.querySelector("h1");
    const judul = elJudul ? elJudul.textContent : "Nonton Anime";

    // nyari iframe video
    const elIframe = doc.querySelector(".responsive-embed iframe") || doc.querySelector("iframe");
    const videoSources = [];

    if (elIframe) {
        let iframeLink = elIframe.getAttribute("src");
        
        // fix link iframe kalo kepotong
        if (iframeLink.startsWith("//")) {
            iframeLink = "https:" + iframeLink;
        }

        videoSources.push(new VideoUrlSource({
            width: 1280,
            height: 720,
            container: "mp4",
            codec: "avc1",
            name: "Desustream Server",
            bitrate: 0,
            duration: 0,
            url: iframeLink
        }));
    } else {
        // fallback dummy biar app ga mental dan ngeluarin popup error di depan
        videoSources.push(new VideoUrlSource({
            width: 1280, height: 720, container: "mp4", codec: "avc1",
            name: "Iframe Ga Nemu Bro", bitrate: 0, duration: 0, url: targetUrl
        }));
    }

    return new PlatformVideoDetails({
        id: new PlatformID("Otakudesu Stream", url, PLUGIN_ID),
        name: judul,
        thumbnails: new Thumbnails([new Thumbnail("", 0)]),
        author: new PlatformAuthorLink(new PlatformID("Otakudesu Stream", "author", PLUGIN_ID), "Otakudesu", BASE_URL, "", 0),
        uploadDate: Math.floor(Date.now() / 1000),
        url: url,
        duration: 1440,
        viewCount: 0,
        isLive: false,
        description: "Nonton via Grayjay Oprekan Bro Satrya 🗿",
        video: new MuxVideoSourceDescriptor({
            isUnMuxed: false,
            videoSources: videoSources
        })
    });
};

source.getSearchCapabilities = function() { return new ResultCapabilities([], [], []); };
source.searchSuggestions = function(query) { return []; };
source.isChannelUrl = function(url) { return false; };
source.getChannel = function(url) { throw new ScriptException("Not implemented"); };
source.getChannelVideos = function(url, type, order, filters) { return new VideoPager([], false); };
source.getChannelCapabilities = function() { return new ResultCapabilities([], [], []); };
