const btn = document.querySelector(".read-gps");

var map = L.map('map').setView([53.006392102274575, 6.539756364748749], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

btn.addEventListener("click", async () => {
    try {
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });

        const textDecoder = new TextDecoderStream();
        port.readable.pipeTo(textDecoder.writable);
        const reader = textDecoder.readable.getReader();

        var marker = L.marker([0, 0]).addTo(map);

        let buffer = "";

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            if (value) {
                buffer += value;
                
                // 1. Hak de buffer in losse regels op basis van een enter (\n)
                let lines = buffer.split("\n");
                // 2. Bewaar het laatste (misschien nog incomplete) stukje in de buffer
                buffer = lines.pop(); 

                // 3. Loop door alle complete regels die zijn binnengekomen
                for (let line of lines) {
                    line = line.trim(); // Schoonmaken
                    
                    // Print alles wat binnenkomt in de console zodat je het kunt zien
                    console.log("Ontvangen:", line);

                    // Kijk of de regel coördinaten bevat (en negeer "geen gps")
                    if (line.includes("lat") && line.includes(",")) {
                        let parts = line.split(","); // Split op de komma
                        if (parts.length === 2) {
                            // parts[0] is bijv. "lat 53.017993" -> we pakken het tweede deel achter de spatie
                            let latPart = parts[0].trim().split(/\s+/); 
                            // parts[1] is bijv. "lon 6.555143" -> we pakken het tweede deel achter de spatie
                            let lonPart = parts[1].trim().split(/\s+/); 

                            let lat = parseFloat(latPart[1]);
                            let lng = parseFloat(lonPart[1]);

                            if (!isNaN(lat) && !isNaN(lng)) {
                                console.log(`GPS Gevonden! Lat: ${lat}, Lng: ${lng}`);
                                marker.setLatLng([lat, lng]);
                                //map.panTo([lat, lng]);
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error("Fout bij verbinden met seriële poort:", error);
    }
});