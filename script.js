const btn = document.querySelector(".read-gps");

var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

btn.addEventListener("click", async () => {
    try {
        // 1. Vraag de gebruiker om een seriële poort te selecteren
        const port = await navigator.serial.requestPort();

        // 2. Open de poort (stel de baudrate in, bijv. 9600 of 115200 voor Arduino)
        await port.open({ baudRate: 115200 });

        // 3. Zet de inkomende stream om naar leesbare tekst
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
        const reader = textDecoder.readable.getReader();

        // 4. Lees continu de data uit
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            // De stream is gestopt
            break;
          }
          if (value) {
            console.log(value);
          }
        }
    } catch (error) {
      console.error("Fout bij verbinden met seriële poort:", error);
    }
});