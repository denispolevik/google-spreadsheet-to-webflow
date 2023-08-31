const fetch = require("node-fetch");
const {GoogleSpreadsheet} = require("google-spreadsheet");
const creds = require("./client_secret.json");
let itemIds = [];
let promises = [];

const _collection_id = "";
const _bearer_token =
    "";
const _doc_id = "";

function updateItems(rows) {
    const durl = `https://api.webflow.com/collections/${_collection_id}/items`;
    const doptions = {
        method: "DELETE",
        headers: {
            accept: "application/json",
            "content-type": "application/json",
            authorization: _bearer_token,
        },
        body: JSON.stringify({itemIds: itemIds}),
    };
    fetch(durl, doptions)
        .then(console.log("All items has been deleted"))
        .then(() => {
            rows.map((row) =>
                fetch(
                    `https://api.webflow.com/collections/${_collection_id}/items`,
                    {
                        method: "POST",
                        headers: {
                            accept: "application/json",
                            "content-type": "application/json",
                            authorization: _bearer_token,
                        },
                        body: JSON.stringify({
                            fields: {
                                name: row.title,
                                description: row.description,
                                "item-id": row["item id"],
                                _archived: false,
                                _draft: true,
                            },
                        }),
                    }
                )
            );
        })
        .then(console.log("All items was updated successfully"))
        .catch((err) => console.error("error:" + err));
}
async function getAllItems(iterator) {
    // setting of tables and fetch options START
    const doc = new GoogleSpreadsheet(_doc_id);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            authorization: _bearer_token,
        },
    };
    // setting of tables and fetch options END

    for (let i = 0; i <= rows.length; i = i + iterator) {
        promises.push(
            fetch(
                `https://api.webflow.com/collections/${_collection_id}/items?limit=${iterator}&offset=${i}`,
                options
            )
                .then((res) => res.json())
                .then((json) => {
                    json.items?.map((item) => itemIds.push(item["_id"]));
                })
        );
    }
    Promise.all(promises).then(() => {
        updateItems(rows);
    });
}

getAllItems(100);