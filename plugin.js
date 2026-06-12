const config = {
    name: "Otakudesu Stream",
    id: "otakudesu-satrya",
    baseUrl: "https://otakudesu.blog"
};

// fix error: pake http client bawaan grayjay
const client = http; 

function getHome() {
    // diganti pake client.GET biar ga reference error
    const response = client.GET(config.baseUrl, {});
    const doc = dom.parse(response);
    
    const kotakAnime = doc.select("div.detpost"); 
    const results = [];
    
    for (let i = 0; i < kotakAnime.length; i++) {
        const kotak = kotakAnime[i];
        const judul = kotak.select("h2.jdlflm").text();
        const gambar = kotak.select("img").attr("src");
        const linkNonton = kotak.select("a").attr("href");
        
        results.push(new PlatformVideo({
            id: linkNonton,
            name: judul,
            thumbnails: [new Thumbnail(gambar)],
            author: new PlatformAuthorLink(new PlatformID(config.id, "otakudesu", config.id), "Otakudesu", config.baseUrl)
        }));
    }
    
    return new VideoPager(results, false);
}

function search(query) {
    const searchUrl = `${config.baseUrl}/?s=${encodeURIComponent(query)}&submit=Search`;
    const response = client.GET(searchUrl, {});
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

source.getHome = getHome;
source.search = search;
