import express from 'express';
import mysql from 'mysql2/promise';
const app = express();

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({process.env.GEMINI_API_KEY});

const statsTemplate = {
    type: "object",
    properties: {
        catname: { type: "string" },
        catHealth: { type: "number" },
        catMove1: { type: "string" },
        catMove1Damage: { type: "number" },
        catMove2: { type: "string" },
        catMove2Damage: { type: "number" },
        catMove3: { type: "string" },
        catMove3Damage: { type: "number" },
        catMove4: { type: "string" },
        catMove4Damage: { type: "number" },
    },
    required: ["catname", "catHealth", "catMove1", "catMove1Damage",
        "catMove2", "catMove2Damage", "catMove3", "catMove3Damage",
        "catMove4", "catMove4Damage"]
};

async function urlToBase64(url) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
}


async function fight(info, imgUrl) {
    const base64Img = await urlToBase64(imgUrl);

    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: [
            {
                parts: [
                    { text: info },
                    {
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: base64Img,
                        }
                    }
                ]
            }
        ],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: statsTemplate,
        },
    });

    return JSON.parse(response.text);
}

async function genMeme(info, imgUrl) {
    const base64Img = await urlToBase64(imgUrl);

    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: [
            {
                parts: [
                    { text: info },
                    {
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: base64Img,
                        }
                    }
                ]
            }
        ],
    });

    return response.text;
}

app.set('view engine', 'ejs');
app.use(express.static('public'));
//for Express to get values using the POST method
app.use(express.urlencoded({ extended: true }));
//routes
app.get('/', async (req, res) => {
    let url = "https://cataas.com/cat?json=true";
    let response = await fetch(url);
    let data = await response.json();

    let picture1 = data['url'];

    console.log(data);
    console.log(picture1);

    let stats1 = await fight(
        `
        You are creating characters for a mini cat fighting game
        based on a picture of a cat being passed to you. This game
        will create four attacking moves similar to a pokemon style
        rpg that will have a certain amount of damage. Your goal is to
        create four silly individual moves for the cat character based
        on its appearance. Please emphasize the individualization of
        the cats, using smaller details from the picture and surroundings
        to further individualize the cat for sillier names. For example,
        if the cat is standing next to a game console, you could call it
        angry gamer cat and give it moves related to that.
        You will also create a cat name and cat health
        component too. You have to always pass this info in the form of a
        JSON object that has:
        {
        catname : exampleNameString,
        catHealth : exampleHealthInt
        catMove1 : exampleCatMove1String
        catMove1Damage : exampleDmgAmountInt
        catMove2 : exampleCatMove2String
        catMove2Damage : exampleDmgAmountInt
        catMove3 : exampleCatMove3String
        catMove3Damage : exampleDmgAmountInt
        catMove4 : exampleCatMove4String
        catMove4Damage : exampleDmgAmountInt
        }

        The catMove items should only have the move name, no description

        Do not under any circumstances return anything but a JSON object
        in this format.
        `, picture1
    );

    url = "https://cataas.com/cat?json=true";
    response = await fetch(url);
    data = await response.json();

    let picture2 = data['url'];


    console.log('------------------------');
    console.log(data);
    console.log(picture2);

    console.log('------------------------');

    let stats2 = await fight(
        `
        You are creating characters for a mini cat fighting game
        based on a picture of a cat being passed to you. This game
        will create four attacking moves similar to a pokemon style
        rpg that will have a certain amount of damage. Your goal is to
        create four silly individual moves for the cat character based
        on its appearance. Please emphasize the individualization of
        the cats, using smaller details from the picture and surroundings
        to further individualize the cat for sillier names. For example,
        if the cat is standing next to a game console, you could call it
        angry gamer cat and give it moves related to that.
        You will also create a cat name and cat health
        component too. You have to always pass this info in the form of a
        JSON object that has:
        {
        catname : exampleNameString,
        catHealth : exampleHealthInt
        catMove1 : exampleCatMove1String
        catMove1Damage : exampleDmgAmountInt
        catMove2 : exampleCatMove2String
        catMove2Damage : exampleDmgAmountInt
        catMove3 : exampleCatMove3String
        catMove3Damage : exampleDmgAmountInt
        catMove4 : exampleCatMove4String
        catMove4Damage : exampleDmgAmountInt
        }

        The catMove items should only have the move name, no description

        Do not under any circumstances return anything but a JSON object
        in this format.
        `, picture2
    );

    console.log(stats1["catname"]);

    res.render("home.ejs", { picture1, picture2, stats1, stats2 });
});

app.get('/meme', async (req, res) => {
    let url = "https://cataas.com/cat?json=true";
    let response = await fetch(url);
    let data = await response.json();

    let picture1 = data['url'];
    let id = data['id'];

    console.log(data);
    console.log(picture1);

    let resp = await genMeme(
        `
        You are creating a small cat meme
        with 2-10 words based on the image
        of the cat you receive. Only ever
        send 2-10 silly words about the cat
        and nothing else.
        `, picture1
    );

    url = `https://cataas.com/cat/${id}/says/${resp}?json=true`;
    response = await fetch(url);
    data = await response.json();

    let meme = data['url'];

    res.render("meme.ejs", { meme })
});

app.get('/createMeme', async (req, res) => {
        let url = `https://cataas.com/cat?json=true`;
        let response = await fetch(url);
        let data = await response.json();

        let picture1 = data['url'];
        let id = data['id'] + "/";

        let meme = data['url'];

        res.render("customMeme.ejs", { meme, id })
});

app.get('/createdMeme', async (req, res) => {
    let custom = req.query.custom;
    let id = req.query.id;
    if (id == null) {
        id = "";
    }
    console.log(custom);
    console.log(id);
    let url = `https://cataas.com/cat/${id}says/${custom}?json=true`;
    let response = await fetch(url);
    let data = await response.json();

    let picture1 = data['url'];

    let meme = data['url'];

    res.render("customizedMeme.ejs", { meme })
});

app.listen(3000, () => {
    console.log("Express server running")
})
