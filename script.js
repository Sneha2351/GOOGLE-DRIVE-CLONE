const CLIENT_ID = '720233636227-4cmoofng05km3ch4gesohsf705lcnkpm.apps.googleusercontent.com';
/*const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04PN7FcUHRDqZCgYIARAAGAQSNwF-L9IrKEm2bbiMZ8pbQD8tYpI5zl2Uv-AHyuIxLBZNBrEZfmjA3QpItnDd9nk1vFbPPpA7QFs';

const oauth2Client = new google.auth.OAuth(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

oauth2Client.setCredentials({refresh_token: REFRESH_TOKEN})
*/
// TODO(developer): Set to client ID and API key from the Developer Console
const API_KEY = 'AIzaSyDfqw2i9zZJoiMCFCFKTz2iu9rfVgTK2Z4';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/drive';

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.getElementById('authorize_button').style.visibility = 'visible';
document.getElementById('signout_button').style.visibility = 'visible';
document.getElementById('add').style.visibility = 'visible';
/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    });
    gisInited = true;
    maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('authorize_button').style.visibility = 'visibility';
        document.getElementById('add_file').style.visibility = 'hidden';
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        document.getElementById('signout_button').style.visibility = 'visible';
       // document.getElementById('authorize_button').innerText = 'SS';
        await listFiles();
    };

    if (gapi.client.getToken() === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        document.getElementById('content').innerText = '';
        document.getElementById('authorize_button').innerText = 'Authorize';
        document.getElementById('signout_button').style.backfaceVisibility = 'hidden';
    }
}
/**
 * Print metadata for first 10 files.
 */
async function createFolder() {
    // Get credentials and build service
    // TODO (developer) - Use appropriate auth mechanism for your app

    const { GoogleAuth } = require('google-auth-library');
    const { google } = require('googleapis');

    const auth = new GoogleAuth({
        scopes: 'https://www.googleapis.com/auth/drive',
    });
    const service = google.drive({ version: 'v3', auth });
    const fileMetadata = {
        name: 'Invoices',
        mimeType: 'application/vnd.google-apps.folder',
    };
    try {
        const file = await service.files.create({
            resource: fileMetadata,
            fields: 'id',
        });
        console.log('Folder Id:', file.data.id);
        return file.data.id;
    } catch (err) {
        // TODO(developer) - Handle error
        throw err;
    }
}
// [END drive_create_folder]

module.exports = createFolder;


    async function listFiles() {
    let response;
    try {
        response = await gapi.client.drive.files.list({
            'pageSize': 10,
            'fields': 'files(id, name)',
        });
    } catch (err) {
        document.getElementById('content').innerText = err.message;
        return;
    }
    const files = response.result.files;
    if (!files || files.length == 0) {
        document.getElementById('content').innerText = 'No files found.';
        return;
    }
    // Flatten to string to display
    const output = files.reduce(
        (str, file) => `${str}${file.name} (${file.id})\n`,
        'Files:\n');
    document.getElementById('content').innerText = output;
}

async function downloadFile(realFileId) {
    // Get credentials and build service
    // TODO (developer) - Use appropriate auth mechanism for your app

    const { GoogleAuth } = require('google-auth-library');
    const { google } = require('googleapis');

    const auth = new GoogleAuth({
        scopes: 'https://www.googleapis.com/auth/drive',
    });
    const service = google.drive({ version: 'v3', auth });

    fileId = realFileId;
    try {
        const file = await service.files.get({
            fileId: fileId,
            alt: 'media',
        });
        console.log(file.status);
        return file.status;
    } catch (err) {
        // TODO(developer) - Handle error
        throw err;
    }
}
// [END drive_download_file]

module.exports = downloadFile;