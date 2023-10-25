
// Imports
import { Auth, google } from "googleapis" //https://stackoverflow.com/a/63509236
import fs from "node:fs/promises"
import path from "path"
import process from "process"

import { authenticate } from "@google-cloud/local-auth"

// If modifying these scopes, delete token.json.
export const SCOPES = [
	"https://mail.google.com/",
	"https://www.googleapis.com/auth/drive",
	"https://www.googleapis.com/auth/forms",
	"https://www.googleapis.com/auth/spreadsheets",
	"https://www.googleapis.com/auth/classroom.rosters",
	"https://www.googleapis.com/auth/classroom.profile.emails",
	"https://www.googleapis.com/auth/classroom.courseworkmaterials",
	"https://www.googleapis.com/auth/classroom.coursework.students",
	"https://www.googleapis.com/auth/classroom.courses"
]
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
export const TOKEN_PATH = path.join( process.cwd(), 'token.json' )
export const CREDENTIALS_PATH = path.join( process.cwd(), 'credentials.json' )

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
export const loadSavedCredentialsIfExist = async () => {
	try {
		const content = await fs.readFile( TOKEN_PATH ) as unknown as string
		const credentials = JSON.parse( content )
		return google.auth.fromJSON( credentials ) as Auth.OAuth2Client //https://stackoverflow.com/a/63509236
	} catch ( err ) {
		return null
	}
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
export const saveCredentials = async ( client: Auth.OAuth2Client ) => {
	const content = await fs.readFile( CREDENTIALS_PATH ) as unknown as string
	const keys = JSON.parse( content )
	const key = keys.installed || keys.web
	const payload = JSON.stringify( {
		type: 'authorized_user',
		client_id: key.client_id,
		client_secret: key.client_secret,
		refresh_token: client.credentials.refresh_token,
	} )
	await fs.writeFile( TOKEN_PATH, payload )
}

/**
 * Load or request or authorization to call APIs.
 *
 */
export const Authorize = async () => {
	let client = await loadSavedCredentialsIfExist()
	if ( client ) {
		return client
	}
	client = await authenticate( {
		scopes: SCOPES,
		keyfilePath: CREDENTIALS_PATH,
	} )
	if ( client.credentials ) {
		await saveCredentials( client )
	}
	return client
}
