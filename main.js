// Import required libraries

const axios = require('axios').default;
const fs = require('fs');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const config = require('./settings/config.json');

// Class for creating and subsequent error handling

class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = "ValidationError";
    }
}

// Sleep function

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Get accounts Id's function

async function getAccountsId() {
    let id = fs.readFileSync("./settings/accountsId.txt", "utf8").toString().split("\n")
    if (id[0].length == 0) {
        throw new ValidationError('No id');
    }
    let clean_id = []
    for (let i = 0; i < id.length; i++) {
        clean_id.push(id[i].replace(/(\r\n|\n|\r)/gm,""))
    }
    return clean_id
}

// Get cookie function

async function getCookie() {
    let response = await axios('https://steamcommunity.com/', {
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'ru-RU,ru;q=0.9',
            'Host': 'steamcommunity.com',
            'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
        },
        method: 'GET'
    })
    return `${response.headers['set-cookie'][0].split(';')[0]}; ${response.headers['set-cookie'][1].split(';')[0]}; timezoneOffset=10800,0; _ga=GA1.2.1480235265.1661188319`
}

// Get Items from inventory function

async function getItemsQuantity(profile_id, game_id, cookie) {
    let response = await axios(`https://steamcommunity.com/inventory/${profile_id}/${game_id}/2?l=russian&count=75`, {
        headers: {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'ru-RU,ru;q=0.9',
            'Cookie': cookie,
            'Host': 'steamcommunity.com',
            'Referer': `https://steamcommunity.com/id/${profile_id}/inventory/`,
            'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
            'X-Requested-With': 'XMLHttpRequest'
        },
        method: 'GET'
    })
    return response.data['total_inventory_count']
}

// Get new item info (name, img-path) function

async function getNewItemInfo(profile_id, game_id, cookie, item_info_lang) {
    let lang;
    if (item_info_lang == "RU") {
        lang = "russian"
    } else if (item_info_lang == "ENG") {
        lang = "english"
    }
    let response = await axios(`https://steamcommunity.com/inventory/${profile_id}/${game_id}/2?l=${lang}&count=75`, {
        headers: {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'ru-RU,ru;q=0.9',
            'Cookie': cookie,
            'Host': 'steamcommunity.com',
            'Referer': `https://steamcommunity.com/id/${game_id}/inventory/`,
            'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
            'X-Requested-With': 'XMLHttpRequest'
        },
        method: 'GET'
    })
    let item_name = response.data['descriptions'][0]['name']
    let icon_url = response.data['descriptions'][0]['icon_url']
    let hash_name = response.data['descriptions'][0]['market_hash_name'].replace(' ', '%20')
    response = await axios(`https://steamcommunity.com/market/priceoverview/?country=${item_info_lang}&currency&appid=${game_id}&market_hash_name=${hash_name}`, {
        headers: {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'ru-RU,ru;q=0.9',
            'Cookie': cookie,
            'Host': 'steamcommunity.com',
            'Referer': `https://steamcommunity.com/id/${game_id}/inventory/`,
            'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
            'X-Requested-With': 'XMLHttpRequest'
        },
        method: 'GET',
        responseType: 'json'
    })
    let lowest_price = response.data['lowest_price']
    let volume = response.data['volume']
    let medium_price = response.data['median_price']
    return [item_name, icon_url, lowest_price, volume, medium_price]
}

// Main function

(async () => {
    console.clear()
    let counter = 0
    let accs_data = []
    let profile_id;
    try {
        const game_id = config['game_id']
        const item_info_lang = config['item_info_lang']
        const hook = new Webhook(config['discord_webhook_url']);
        const accs_id = await getAccountsId()
        const cookie = await getCookie()
        const accs_quantity = accs_id.length
        // Required variables
        while (counter < accs_quantity) { // Getting the first information / inventory status
            profile_id = accs_id[counter]
            let acc_items_quantity = await getItemsQuantity(profile_id, game_id, cookie)
            accs_data.push([profile_id, acc_items_quantity])
            await sleep(5000)
            counter += 1
            console.log('\x1b[32m%s\x1b[0m', 'Getting Inventory Information: ', `${counter} / ${accs_quantity}`)
        }
        counter = counter - counter
        console.log('\x1b[32m%s\x1b[0m', 'Inventory information received successfully')
        while (true) { // Monitoring
            profile_id = accs_id[counter]
            let acc_items_quantity = await getItemsQuantity(profile_id, game_id, cookie)
            if (acc_items_quantity > accs_data[counter][1]) {
                let item_data = await getNewItemInfo(profile_id, game_id, cookie, item_info_lang)
                const embed = new MessageBuilder()
                .setTitle('New Item')
                .setAuthor('S.I.O', 'https://i.ibb.co/ts3TLRD/11.png', 'https://github.com/vsidorik/steam-inventory-observer')
                .setURL('https://github.com/vsidorik/steam-inventory-observer')
                .addField('Item name: ', item_data[0], false)
                .addField('Lowest price: ', item_data[2], false)
                .addField('Volume: ', item_data[3], false)
                .addField('Medium price: ', item_data[4], false)
                .setColor('#02a62d')
                .setThumbnail('https://i.ibb.co/ts3TLRD/11.png')
                .setImage(`https://community.cloudflare.steamstatic.com/economy/image/${item_data[1]}`)
                .setFooter('From SidoriK.V with love <3', 'https://sun9-19.userapi.com/impg/eBhH5BiPqdAs8jEHpI-6bxhbti9MjEGoTRU-AA/OvmiOPTbYV0.jpg?size=1440x1440&quality=95&sign=e2242066af7fe4adf00a10a05665e44b&type=album')
                .setTimestamp();
                hook.send(embed);
                console.log('\x1b[32m%s\x1b[0m', 'New item! Info has been send', '|', profile_id)
                accs_data[counter][1] = acc_items_quantity
            }
            let timenow = new Date().toISOString()
            console.log('Monitoring:', `${counter + 1} / ${accs_quantity} | Profile Id: ${profile_id} | ItemsQuantity: ${acc_items_quantity} | ${timenow}`)
            counter += 1
            if (counter >= accs_quantity) { counter = counter - counter}
            await sleep(10000)
        }
    } catch (e) {
        if (e.code === 'ENOENT') { // Errors handling
            console.log('\x1b[31m%s\x1b[0m', 'Failed to retrieve accounts id information. Check file with id please')
        } else if (e.message === 'No id') {
            console.log('\x1b[31m%s\x1b[0m', 'Number of id less than 0')
        } else if (e.message === 'Request failed with status code 404') {
            console.log('\x1b[31m%s\x1b[0m', 'Code 404:', '\x1b[31m%s\x1b[0m', 'You may not have filled in the correct link in the accountsId.txt file | it is necessary to fill in exactly steamID64 ID')
        } else if (e.message === 'Request failed with status code 403') {
            console.log('\x1b[31m%s\x1b[0m', 'User inventory is hidden | ', profile_id)
        }
    }
})()