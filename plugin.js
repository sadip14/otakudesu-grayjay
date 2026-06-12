const PLUGIN_ID = "otakudesu-satrya";
const BASE_URL = "https://otakudesu.blog";

// 1. fungsi wajib biar plugin ga error pas dihidupin/dimatiin
source.enable = function(conf) {};
source.disable = function() {};

// 2. nampilin home (ongoing anime)
source.getHome = function() {
    const resp = http.GET(BASE_URL, {});
    // handle respons bentuk objek atau string
    const html = typeof resp === 'string' ? resp : resp.body;
    const doc = dom.parse(html);
    
    const kotakAnime = doc.select("div.detpost"); 
    const results = [];
    
    for (let i = 0; i < kotakAnime.length; i++) {
        const kotak = kotakAnime[i];
        const judul = kotak.select("h2.jdlflm").text();
        const gambar = kotak.select("img").attr("src");
        const linkNonton = kotak.select("a").attr("href");
        
        // format udah full ngikutin PlatformVideoDef lu
        results.push(new PlatformVideo({
            id: new PlatformID("otakudesu", linkNonton, PLUGIN_ID),
            name: judul,
            thumbnails: new Thumbnails([new Thumbnail(gambar, 0)]),
            author: new PlatformAuthorLink(new PlatformID("otakudesu", "author", PLUGIN_ID), "Otakudesu", BASE_URL, "", 0),
            uploadDate: Math.floor(Date.now() / 1000), // asal isi biar grayjay ga marah
            url: linkNonton,
            duration: 1440,
            viewCount: 0,
            isLive: false
        }));
    }
    
    return new VideoPager(results, false);
};

// 3. nampilin hasil search
source.search = function(query, type, order, filters) {
    const searchUrl = BASE_URL + "/?s=" + encodeURIComponent(query) + "&submit=Search";
    const resp = http.GET(searchUrl, {});
    const html = typeof resp === 'string' ? resp : resp.body;
    const doc = dom.parse(html);
    
    const listSearch = doc.select(".chivsrc li");
    const results = [];
    
    for (let i = 0; i < listSearch.length; i++) {
        const kotak = listSearch[i];
        const linkNonton = kotak.select("a").attr("href");
        const judul = kotak.select("h2").text();
        const gambar = kotak.select("img").attr("src");
        
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
    
    return new VideoPager(results, false);
};

// 4. perintilan wajib lainnya biar ga error reference
source.getSearchCapabilities = function() { return new ResultCapabilities([], [], []); };
source.searchSuggestions = function(query) { return []; };
source.isChannelUrl = function(url) { return false; };
source.getChannel = function(url) { throw new ScriptException("Not implemented"); };
source.getChannelVideos = function(url, type, order, filters) { return new VideoPager([], false); };
source.getChannelCapabilities = function() { return new ResultCapabilities([], [], []); };
source.isVideoDetailsUrl = function(url) { return url.includes("otakudesu.blog/anime/"); };
source.getVideoDetails = function(url) { throw new ScriptException("Belum dibikin wkwk"); };
