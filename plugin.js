// nyiapin konfigurasi source utama grayjay
const config = {
    name: "Otakudesu Stream",
    id: "otakudesu-satrya",
    baseUrl: "https://otakudesu.blog"
};

// ini fungsi wajib biar grayjay tau cara nampilin halaman utama
function getHome() {
    const response = http.GET(config.baseUrl, {});
    const doc = dom.parse(response);
    
    // selector hasil buruan lu kemarin
    const kotakAnime = doc.select("div.detpost"); 
    const results = [];
    
    for (let i = 0; i < kotakAnime.length; i++) {
        const kotak = kotakAnime[i];
        const judul = kotak.select("h2.jdlflm").text();
        const gambar = kotak.select("img").attr("src");
        const linkNonton = kotak.select("a").attr("href");
        
        // format wajib penulisan object video di grayjay
        results.push(new PlatformVideo({
            id: linkNonton,
            name: judul,
            thumbnails: [new Thumbnail(gambar)],
            author: new PlatformAuthorLink(new PlatformID(config.id, "otakudesu", config.id), "Otakudesu", config.baseUrl)
        }));
    }
    
    return new VideoPager(results, false);
}

// ini fungsi wajib biar grayjay bisa pake kolom search
function search(query) {
    const searchUrl = `${config.baseUrl}/?s=${encodeURIComponent(query)}&submit=Search`;
    const response = http.GET(searchUrl, {});
    const doc = dom.parse(response);
    
    const listSearch = doc.select(".chivsrc li");
    const results = [];
    
    for (let i = 0; i < listSearch.length; i++) {
        const kotak = listSearch[i];
        results.push(new PlatformVideo({
            id: kotak.select("a").attr("href"),
            name: kotak.select("h2").text(),
            thumbnails: [new Thumbnail(kotak.select("img").attr("src"))],
            author: new PlatformAuthorLink(new PlatformID(config.id, "otakudesu", config.id), "Otakudesu", config.baseUrl)
        }));
    }
    
    return new VideoPager(results, false);
}

// ngedaftarin semua fungsi ke sistem grayjay
source.getHome = getHome;
source.search = search;
