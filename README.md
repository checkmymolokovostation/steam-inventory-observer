<p align="center">
      <img src="https://i.ibb.co/ts3TLRD/11.png" width="726">
</p>

<p align="center">
   <img src="https://img.shields.io/badge/Version-1.0.0-blue" alt="Project Version">
   <img src="https://img.shields.io/badge/License-M.I.T-blue" alt="License">
</p>

## About
A very useful tool for those who want to monitor item drops on their steam account. Especially this script is suitable for those who have many accounts / account farm, for example, for playing CS: GO
## Documentation
### Install:
1. Install the Node.js version on the LTS machine/server
2. Upload the project to any convenient folder on the computer / server
3. Install the required packages from the requirements.txt file. To install, open cmd or powershell and type npm install __package name__ one by one
### Setting:
1. Set up the __accountsId.txt__ file. To do this, paste in the ID's of the accounts that have an inventory open and that you need to view. __One account = One line__</br>
2. Set up the __config.json__ file. Fill in: __game_id__, __item_info_lang__, __discord_webhook_url__</br>
**`game_id`** - Game id</br>
**`item_info_lang`** - The language in which information about the item in the hook will be sent. Available Russian and English | RU / ENG</br>
**`discord_webhook_url`** - Discord webhook url</br>
### Launch:
To run the script after all the settings, you need to open cmd in the folder where the project is located, and specifically the file main.js</br>
**`node main.js`**
### F.A.Q
1. What exactly should I enter in accountsId.txt?</br>
- Steam64 account id steam</br>
2. Can I get banned for this?</br>
- Not. During parsing, authorization to the Steam account does not occur. Everything works through the Steam API. The only thing is that your IP address can be blocked for a short time for violent activity, so if you can run the bot on the server, run the bot on the server</br>
3. What is the speed of checking accounts?</br>
- I've reduced the speed of the script to 10 seconds between checking accounts. This is done so that the IP address is not banned very often.</br>
## Developers
- [Vladimir Sidorik - Github](https://github.com/vsidorik)
- [Vladimir Sidorik - Vk](https://vk.com/sidorikv)
## License
Project Steam Inventory Parser (S.I.O) is distributed under the MIT license.
