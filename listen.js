async function main() {
    var abi = require("./abi.json")
    const axios = require('axios').default;
    var Twitter = require('twitter');
    require('dotenv').config();
    const { API_URL, TWITTER_API_KEY, TWITTER_API_KEY_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET } = process.env;

    var client = new Twitter({
        consumer_key: TWITTER_API_KEY,
        consumer_secret: TWITTER_API_KEY_SECRET,
        access_token_key: TWITTER_ACCESS_TOKEN,
        access_token_secret: TWITTER_ACCESS_TOKEN_SECRET
    });

    const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
    const web3 = createAlchemyWeb3(API_URL);

    const onNewDream = async function (error, result) {
        if (!error) {
            const data = getDataDecoded(result.data)
            const osInfos = await getTerraAsset(data.tokenId)
            const username = osInfos.owner.user.username == null ? osInfos.owner.user.address : osInfos.owner.user.username
            await tweet(`✨🏰 New dream published:\nAnimated Url: ${osInfos.animation_original_url}\nOwner: ${username}\nBlock Number: ${result.blockNumber}\nOpenSea Asset Link: ${osInfos.permalink}`)
            console.log("New tweet sent")
        }
    }

    const subTopics = web3.eth.subscribe("logs", {"address": "0x4E1f41613c9084FdB9E34E11fAE9412427480e56", "topics": ["0x45be0e1ab4f13227fa0c4e2419af72c74f30c385b00c34497e68550f3b40dedb"] }, onNewDream)

    subTopics.on("connected", data => {
        console.log(data)
    })

    subTopics.on("error", error => {
        console.log("Error")
        console.log(error)
        subTopics.subscribe(onNewDream)
    })




    function getDataDecoded(data) {
        return web3.eth.abi.decodeLog(abi, data, ["0x45be0e1ab4f13227fa0c4e2419af72c74f30c385b00c34497e68550f3b40dedb"])
    }

    async function getTerraAsset(tokenId) {
        const response = await axios.get(`https://api.opensea.io/api/v1/asset/0x4E1f41613c9084FdB9E34E11fAE9412427480e56/${tokenId}`)
        return response.data
    }

    async function tweet(message) {
        await client.post('statuses/update', { status: message })
    }
}



main();