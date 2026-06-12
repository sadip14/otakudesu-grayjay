const BASE_URL = "https://otakudesu.blog";

// fungsi narik data feed halaman depan
function getHome() {
    // nyuruh grayjay buka webnya
    const response = http.GET(BASE_URL, {});
    const doc = dom.parse(response);
    
    const hasilAnime = [];
    
    // robot nyari semua kotak anime pake selector lu
    const kotakAnime = doc.select("div.detpost"); 
    
    // robot ngebedah satu-satu isi kotaknya
    for (let kotak of kotakAnime) {
        let judul = kotak.select("h2.jdlflm").text();
        let gambar = kotak.select("img").attr("src");
        let linkEps = kotak.select("a").attr("href");
        
        // masukin ke daftar tontonan grayjay
        hasilAnime.push({
            title: judul,
            thumbnail: gambar,
            url: linkEps
        });
    }
    
    return hasilAnime;
}

// fungsi buat nyari anime (search)
function search(query) {
    const searchUrl = BASE_URL + "/?s=" + encodeURIComponent(query) + "&submit=Search";
    const response = http.GET(searchUrl, {});
    const doc = dom.parse(response);
    
    const hasilSearch = [];
    // selector buat hasil pencarian (biasanya pake .chivsrc li)
    const listSearch = doc.select(".chivsrc li");
    
    for (let kotak of listSearch) {
        hasilSearch.push({
            title: kotak.select("h2").text(),
            thumbnail: kotak.select("img").attr("src"),
            url: kotak.select("a").attr("href")
        });
    }
    
    return hasilSearch;
}
