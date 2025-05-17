import {GoogleGenAI} from "@google/genai";

export default function handler(req, res) {
    const url = req.query.url;
    if (!url) {res.status(400).json({error: "No URL provided"}); return;}
    const exampleRecipe = {
        "name": "Soy-Ginger Flank Steak",
        "cat": "Red Meat",
        "time": 45,
        "ingredients": [
            {
                "type": "pick one",
                "ingredients": [
                    {
                        "amount": 1,
                        "size": "Tablespoon",
                        "ingredient": "Vegetable Oil"
                    },
                    {
                        "amount": 1,
                        "size": "Tablespoon",
                        "ingredient": "Canola Oil"
                    }
                ]
            },
            {
                "amount": 1.5,
                "size": "Tablespoons",
                "ingredient": "Ginger",
                "comment": [
                    "Peeled, finely grated"
                ]
            },
            {
                "amount": 1,
                "size": "Tablespoon",
                "ingredient": "Garlic",
                "comment": [
                    "Minced"
                ]
            },
            {
                "type": "pick one",
                "ingredients": [
                    {
                        "amount": 0.66,
                        "size": "Cup",
                        "ingredient": "Soy Sauce",
                        "comment": [
                            "Low sodium"
                        ]
                    },
                    {
                        "type": "and",
                        "ingredients": [
                            {
                                "amount": 0.5,
                                "size": "Cup",
                                "ingredient": "Soy Sauce"
                            },
                            {
                                "amount": 3,
                                "size": "Tablespoons",
                                "ingredient": "Water"
                            }
                        ]
                    }
                ]
            },
            {
                "amount": 0.5,
                "size": "Cup",
                "ingredient": "Brown Sugar",
                "comment": [
                    "Light or dark",
                    "Lightly packed"
                ]
            },
            {
                "amount": 0.5,
                "size": "Teaspoon",
                "ingredient": "Red Pepper Flakes",
                "comment": [
                    "Optional"
                ]
            },
            {
                "amount": [
                    2.5,
                    3
                ],
                "size": " Pound",
                "ingredient": "Flank Steak"
            },
            {
                "ingredient": "Black Pepper",
                "comment": [
                    "Ground"
                ]
            },
            {
                "ingredient": "Scallions",
                "comment": [
                    "Thinly sliced",
                    "White & (Optionally) Light Green parts"
                ]
            },
            {
                "ingredient": "Lime Wedges",
                "comment": [
                    "For serving"
                ]
            },
            {
                "ingredient": "Rice",
                "comment": [
                    "Cooked",
                    "For serving"
                ]
            }
        ],
        "steps": [
            "Preheat the broiler.",
            "Heat the oil in a small saucepan over medium heat. Add the ginger and garlic and cook, stirring, until you can really smell everything and the garlic turns golden, about 3 minutes. Add the soy sauce, brown sugar, and red pepper flakes (optional). Increase the heat to medium-high and let the soy glaze simmer until slightly reduced and syrupy, stirring occasionally, about 5 minutes. Set the glaze aside to cool for about 5 minutes.",
            "Season the flank steak lightly with black pepper. Brush the top side of the flank steak with some of the soy glaze, then broil it for 4 minutes. Using tongs, turn the steak, then brush the second side with the glaze.Broil the glank steak until it is done to your liking, about 4 minutes longer for medium-rare. Transfer the steak to a cutting board and let it sit for 5 minutes. Meanwhile, bring the remaining soy glaze to a simmer over low heat.",
            "Thinly slice the flank steak across the grain and brush the slices with some of the reheated soy glaze. Transfer the sliced steak to a platter and scatter the scallions, if using, on top. Arrange the lime wedges on the edge of the platter for people to squeeze over their steak if they like. Put the rest of the soy glaze in a small pitcher or bowl to serve at the table for drizzling over the rice."
        ],
    }
    const schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "RecipeList",
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "name": { "type": "string" },
                "cat": { "type": "string" },
                "time": { "type": "number" },
                "ingredients": {
                    "type": "array",
                    "items": {
                        "oneOf": [
                            {
                                "type": "object",
                                "properties": {
                                    "amount": {
                                        "oneOf": [
                                            { "type": "number" },
                                            {
                                                "type": "array",
                                                "items": { "type": "number" }
                                            }
                                        ]
                                    },
                                    "size": { "type": "string" },
                                    "ingredient": { "type": "string" },
                                    "comment": {
                                        "type": "array",
                                        "items": { "type": "string" }
                                    }
                                },
                                "required": ["ingredient"]
                            },
                            {
                                "type": "object",
                                "properties": {
                                    "type": { "type": "string" },
                                    "name": { "type": "string" },
                                    "ingredients": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "amount": {
                                                    "oneOf": [
                                                        { "type": "number" },
                                                        {
                                                            "type": "array",
                                                            "items": { "type": "number" }
                                                        }
                                                    ]
                                                },
                                                "size": { "type": "string" },
                                                "ingredient": { "type": "string" },
                                                "comment": {
                                                    "type": "array",
                                                    "items": { "type": "string" }
                                                }
                                            },
                                            "required": ["ingredient"]
                                        }
                                    }
                                },
                                "required": ["type", "ingredients"]
                            }
                        ]
                    }
                },
                "steps": {
                    "type": "array",
                    "items": { "type": "string" }
                }
            },
            "required": ["name", "cat", "time", "ingredients", "steps"]
        }
    }

    async function parseRecipe(url) {
        if (!process.env.GOOGLE_GEMMA_API_KEY) {res.status(400).json({error: `No API key found: ${process.env.GOOGLE_GEMMA_API_KEY}`}); return;}
        const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_GEMMA_API_KEY});
        return await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `If an example JSON object for storing a recipe looks like this: ${JSON.stringify(exampleRecipe)} AND a schema based off that ${JSON.stringify(schema)}, then parse ${url} to create an object of the recipe listed there with a similar structure. Follow the capitalization of the example recipe object and make sure to put all modifiers of ingredients in the comments or measurements (the sizing measurement, can include small, large, cup, teaspoon, bag). If there is no cooking recipe to be found that includes reasonable ingredients, return an empty object ({})`,
        });
    }
    try {
        parseRecipe(url).then(response => {
            res.status(200).json(response.text.split("```json")[1].split("```")[0])
        })
    } catch (error) {
    console.error("Error:", error);
        res.status(400).json({error: `Internal server error: ${error}`});
    }

}
