const PLUGIN_ID = "otakudesu-satrya";
const BASE_URL = "https://otakudesu.blog";

source.enable = function(conf) {};
source.disable = function() {};

source.getHome = function() {
    const resp = http.GET(BASE_URL, {});
    const html = typeof resp === 'string' ? resp : resp.body;
    
    // Pake domParser bawaan package Grayjay
    const doc = domParser.parseFromString(html);
    
    // Pake standar Javascript (querySelectorAll), bukan syntax jQuery (select)
    const kotakAnime = doc.querySelectorAll("div.detpost"); 
    const results = [];
    
    for (let i = 0; i < kotakAnime.length; i++) {
        const kotak = kotakAnime[i];
        
        // Pake querySelector buat nyari elemen di dalem kotaknya
        const elJudul = kotak.querySelector("h2.jdlflm");
        const elGambar = kotak.querySelector("img");
        const elLink = kotak.querySelector("a");
        
        // Pengecekan biar ga error kalo misal ada kotak iklan nyempil
        if (elJudul && elGambar && elLink) {
            const judul = elJudul.textContent; // ganti .text()
            const gambar = elGambar.getAttribute("src"); // ganti .attr()
            const linkNonton = elLink.getAttribute("href");
            
            results.push(new PlatformVideo({
                id: new PlatformID("otakudesu", linkNonton, PLUGIN_ID),
                name: judul,
                thumbnails: new Thumbnails([new Thumbnail(gambar, 0)]),
                author: new PlatformAuthorLink(new PlatformID("otakudesu", "author", PLUGIN_ID), "Otakudesu", BASE_URL, "", 0),
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
                id: new PlatformID("otakudesu", linkNonton, PLUGIN_ID),
                name: judul,
                thumbnails: new Thumbnails([new Thumbnail(gambar, 0)]),
                author: new PlatformAuthorLink(new PlatformID("otakudesu", "author", PLUGIN_ID), "Otakudesu", BASE_URL, "", 0),
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

source.getSearchCapabilities = function() { return new ResultCapabilities([], [], []); };
source.searchSuggestions = function(query) { return []; };
source.isChannelUrl = function(url) { return false; };
source.getChannel = function(url) { throw new ScriptException("Not implemented"); };
source.getChannelVideos = function(url, type, order, filters) { return new VideoPager([], false); };
source.getChannelCapabilities = function() { return new ResultCapabilities([], [], []); };
source.isVideoDetailsUrl = function(url) { return url.includes("otakudesu.blog/anime/"); };
source.getVideoDetails = function(url) { throw new ScriptException("Belum dibikin"); };
