import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

app.post('/mailchimp-proxy', async (req, res) => {
    const { name, email, subject } = req.body;
    const listID = 'e28f6568ed';
    const templateID = 10041627;

    try {
        //Create a Member in Mailchimp
        const memberResponse = await fetch(`https://us13.api.mailchimp.com/3.0/lists/${listID}/members`, {
            method: 'POST',
            body: JSON.stringify({
                email_address: email,
                status: 'subscribed',
                merge_fields: {
                    FNAME: name,
                    LNAME: subject
                },
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic a0f68aa5c59ff0f7f5cfe0833b4a6fef-us13',
            },
        });

        if (memberResponse.ok) {
            const memberData = await memberResponse.json();

            //Fetch Mailchimp Template
            const templateResponse = await fetch(`https://us13.api.mailchimp.com/3.0/templates/${templateID}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic a0f68aa5c59ff0f7f5cfe0833b4a6fef-us13',
                }
            });

            if (templateResponse.ok) {
                const templateData = await templateResponse.json();
                const templateIDFromResponse = templateData.id;
                const newMemberEmail = memberData.email_address;

                // Create a campaign
                const campaignResponse = await fetch(`https://us13.api.mailchimp.com/3.0/campaigns`, {
                    method: 'POST',
                    body: JSON.stringify({
                        type: 'regular',
                        recipients: { list_id: listID, segment_opts: { match: 'all', conditions: [{ condition_type: 'EmailAddress', field: 'EMAIL', op: 'is', value: newMemberEmail }] } },
                        settings: {
                            subject_line: 'Welcome to Our Newsletter',
                            from_name: 'Bilal Dogar',
                            reply_to: 'bilaldogar733@gmail.com',
                            template_id: templateIDFromResponse,
                        },
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic a0f68aa5c59ff0f7f5cfe0833b4a6fef-us13',
                    }
                });

                if (campaignResponse.ok) {
                    const campaignData = await campaignResponse.json();

                    // Send the campaign
                    const sendResponse = await fetch(`https://us13.api.mailchimp.com/3.0/campaigns/${campaignData.id}/actions/send`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer a0f68aa5c59ff0f7f5cfe0833b4a6fef-us13', 
                        }
                    });

                    if (sendResponse.ok) {
                        res.status(200).json({ code: 200, message: "Mail Sent Sucessfully" , style:"  transition:0.4s; padding: 10px 15px; background:#fff; border: 1px solid #1fb526 ;text-align: center; color: #1fb526; border-radius: 10px"}); 
                    } else {
                        res.status(500).json({ code: 500, message: 'Error Sending Mail from Mailchimp' , style:"  transition:0.4s; padding: 10px 15px; background:#fff; border: 1px solid #f50518 ;text-align: center; color: #f50518; border-radius: 10px"});
                    }
                } else {
                    res.status(500).json({ code: 500, message: 'Error Retrieving Campaign from Mailchimp' , style:"  transition:0.4s; padding: 10px 15px; background:#fff; border: 1px solid #f50518 ;text-align: center; color: #f50518; border-radius: 10px"});
                }
            } else {
                res.status(500).json({ code: 500, message: 'Error Retrieving Template from Mailchimp' , style:"  transition:0.4s; padding: 10px 15px; background:#fff; border: 1px solid #f50518 ;text-align: center; color: #f50518; border-radius: 10px" });
            }
        } else {
            res.status(409).json({ code: 409, message: 'User Email is already Exist', style:"  transition:0.4s; padding: 10px 15px; background:#fff; border: 1px solid #f50518 ;text-align: center; color: #f50518; border-radius: 10px" });
        }
    } catch (error) {
        res.status(500).json({ code: 500, message: 'Internal Server Error' , style:"  transition:0.4s; padding: 10px 15px; background:#fff; border: 1px solid #f50518 ;text-align: center; color: #f50518; border-radius: 10px"});
    }
});

app.listen(port, () => {
});