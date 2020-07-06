# Edge Agent - Test

## Prerequisites (General)

- Vue.js
- Go 1.13
- Npm
- GitHub packages setup : generate github [personal token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line#creating-a-token) 
and set it to GITHUB_TOKEN [environment variable](https://en.wikipedia.org/wiki/Environment_variable).

## Prerequisites (for running tests and demos)
- Docker
- Docker-Compose
- Make

## BDD Test Prerequisites

Run (`make generate-test-keys`) to generate tls keys and import ec-cacert.pem in cert chain

You need to modify your hosts file (`/etc/hosts` on \*NIX) to add the following lines, to allow few of the bdd test containers to be connected to externally. 

    127.0.0.1 testnet.trustbloc.local
    127.0.0.1 stakeholder.one
    127.0.0.1 sidetree-mock

## Targets
```
# run checks and unit tests
make all

# run linter checks
make checks

# run unit test
make unit-test

# run unit test for wasm components
make unit-test-wasm

# create docker image for user agent wasm
make user-agent-wasm-docker

# generate tls keys
make generate-test-keys
```

## Steps

```bash
make clean user-agent-wasm-docker generate-test-keys
cd test/bdd/fixtures/agent-wasm
(source .env && docker-compose down && docker-compose up --force-recreate)
```

## Agents

- To access user agent wasm open [user home page](https://127.0.0.1:8091/dashboard).
- To access second user agent wasm open [user home page](https://127.0.0.1:8071/dashboard).

## How to establish a did-connection between agents?

1. Go to `Connections` page and register the router for both agents. Use `http://localhost:10093` as a router URL.
Once the router was registered do not reload the page. It will lose the WebSocket connection.
2. On the `Connections` page go to `Create Invitation` section. Fill up a form to create an invitation.
Copy that invitation to the buffer. Make sure you copied only the invitation payload. e.g
    ```
    {
        "@id": "3f3fda9c-bfed-4b21-9d9f-cbc4d2209f84",
        "@type": "https://didcomm.org/didexchange/1.0/invitation",
        "label": "user-agent",
        "recipientKeys": [
          "EfmBzcTEtkQDh8Gjfc4ZpGSaqfAD8x9PRXroFt2mveKu"
        ],
        "routingKeys": [
          "GGezjrL4TTeev9VeBWgaqoAUWBK7JCuzuvRpNME1u4J1"
        ],
        "serviceEndpoint": "http://localhost:10091"
    }
    ```
3. Go to `Connections` page on the opposite agent (e.g if the invitation was created on the first agent
then you need to receive it on the second agent and vice versa). Find the `Receive Invitation` section.
To receive an invitation fill up a form using an invitation you created in the previous step.
4. In the `Query Connections` section, you will see that a new connection appeared with the state `invited`.
This connection also has two buttons `Accept`/`Decline`. Hit the `Accept` button.
5. Go to the opposite agent and refresh your connections by clicking on the refresh button in the `Query Connections`
section. The new connection should appear with the state `requested`. Hit the `Accept` button to accept it.

Congratulations! You successfully established a did-connection between two agents.

## How to exchange a presentation through the Present Proof protocol?

1. Go to the `Present Proof` page and send a request presentation.
You can use an empty payload e.g `{}` for `RequestPresentation` message.
Select the connection and hit the `SEND` button.
2. Go to the opposite agent. Open the `Present Proof` page.
You will see a new action in the Actions section. Hit the `Accept` button and provide the Presentation message.
You can use this message for the test:
    ```
    {
        "presentations~attach": [{
            "lastmod_time": "0001-01-01T00:00:00Z",
            "data": {
                "base64": "ZXlKaGJHY2lPaUp1YjI1bElpd2lkSGx3SWpvaVNsZFVJbjAuZXlKcGMzTWlPaUprYVdRNlpYaGhiWEJzWlRwbFltWmxZakZtTnpFeVpXSmpObVl4WXpJM05tVXhNbVZqTWpFaUxDSnFkR2tpT2lKMWNtNDZkWFZwWkRvek9UYzRNelEwWmkwNE5UazJMVFJqTTJFdFlUazNPQzA0Wm1OaFltRXpPVEF6WXpVaUxDSjJjQ0k2ZXlKQVkyOXVkR1Y0ZENJNld5Sm9kSFJ3Y3pvdkwzZDNkeTUzTXk1dmNtY3ZNakF4T0M5amNtVmtaVzUwYVdGc2N5OTJNU0lzSW1oMGRIQnpPaTh2ZDNkM0xuY3pMbTl5Wnk4eU1ERTRMMk55WldSbGJuUnBZV3h6TDJWNFlXMXdiR1Z6TDNZeElsMHNJbWh2YkdSbGNpSTZJbVJwWkRwbGVHRnRjR3hsT21WaVptVmlNV1kzTVRKbFltTTJaakZqTWpjMlpURXlaV015TVNJc0ltbGtJam9pZFhKdU9uVjFhV1E2TXprM09ETTBOR1l0T0RVNU5pMDBZek5oTFdFNU56Z3RPR1pqWVdKaE16a3dNMk0xSWl3aWRIbHdaU0k2V3lKV1pYSnBabWxoWW14bFVISmxjMlZ1ZEdGMGFXOXVJaXdpUTNKbFpHVnVkR2xoYkUxaGJtRm5aWEpRY21WelpXNTBZWFJwYjI0aVhTd2lkbVZ5YVdacFlXSnNaVU55WldSbGJuUnBZV3dpT201MWJHeDlmUS4="
            }
        }]
    }
    ```
3. Go to the opposite agent. Open the `Present Proof` page. You will see a action in the `Actions` section.
Hit the `Accept` button and provide a name for the presentation.
4. Go to the `Dashboard` page. In the `My Stored Presentations` section, you will see the presentation you received.

## How to issue credentials through the Issue Credential protocol?

1. Go to `Issue Credential` page and send an offer. You can use an empty JSON payload e.g `{}`.
   Also, you need to select the connection (to whom the offer should be sent). Hit the SEND button.
2. Go to the `Issue Credential` page on the opposite agent. In the `Actions` section you will see a new action.
There will be an accept button. Hit that button.
3. Go to the `Issue Credential` page on the opposite agent. In the `Actions` section hit the refresh button.
You will see a new action. There will be an accept button. Hit that button. On the modal window provide your credential.
You can use this payload to do that.
    ```
    {
       "credentials~attach":[
          {
             "lastmod_time":"0001-01-01T00:00:00Z",
             "data":{
                "json":{
                   "@context":[
                      "https://www.w3.org/2018/credentials/v1",
                      "https://www.w3.org/2018/credentials/examples/v1"
                   ],
                   "credentialSubject":{
                      "ID":"SubjectID"
                   },
                   "id":"http://example.edu/credentials/1872",
                   "issuanceDate":"2010-01-01T19:23:24Z",
                   "issuer":{
                      "id":"did:example:76e12ec712ebc6f1c221ebfeb1f",
                      "name":"Example University"
                   },
                   "referenceNumber":83294847,
                   "type":[
                      "VerifiableCredential",
                      "UniversityDegreeCredential"
                   ]
                }
             }
          }
       ]
    }
    ```
4. Go to the `Issue Credential` page on the opposite agent. In the `Actions` section hit the refresh button.
You will see a new action. There will be an accept button. Hit that button. On the modal window provide your credential name.
5. We are done! Go to the Presentation page to check that credentials are stored. There will be a select button with your credential.