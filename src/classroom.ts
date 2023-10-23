/* eslint-disable @typescript-eslint/no-explicit-any */
import { classroom_v1, google } from "googleapis"

// import { askQuestion } from "./masteryQuiz"

export interface quizOptions {
	alternateLink?: string,
	assigneeMode: "ALL_STUDENTS" | "INDIVIDUAL_STUDENTS", // ALL_STUDENTS or INDIVIDUAL_STUDENTS ---> If using INDIVIDUAL_STUDENTS, do individualStudentOptions
	assignment?: {
		id: string,
		title: string,
		alternateLink: string
	},
	associatedWithDeveloper?: boolean,
	courseId?: string,
	creationTime?: string,
	creatorUserId?: string,
	description?: string,
	dueDate?: {
		day: number
		month: number
		year: number
	},
	dueTime?: {
		hours: number
		minutes: number
		nanos: number
		seconds: number
	},
	gradeCategory?: {

		defaultGradeDenominator: number,
		id: string,
		name: string,
		weight: number
	},
	id?: string,
	individualStudentsOptions?: {
		studentIds: number[]
	},
	// This might be jacked up??
	materials?: [
		{
			driveFile?: {
				driveFile: {
					alternateLink: string,
					id: string,
					thumbnailUrl: string,
					title: string
				},
				shareMode: string
			},
			form?: {
				formUrl: string,
				responseUrl: string,
				thumbnailUrl: string,
				title: string
			},
			link?: {
				thumbnailUrl: string,
				title: string,
				url: string
			},
			youtubeVideo?: {
				alternateLink: string,
				id: string,
				thumbnailUrl: string,
				title: string
			}
		},
	],
	maxPoints: number | 0,// 0 for ungraded
	multipleChoiceQuestion?: {
		choices: string[]
	},
	scheduledTime?: string,
	state: "PUBLISHED" | "DRAFT" | "DELETED",
	submissionModificationMode: "MODIFIABLE_UNTIL_TURNED_IN" | "MODIFIABLE",
	title: string,
	topicId?: string,
	updateTime?: string,
	workType: "ASSIGNMENT" | "SHORT_ANSWER_QUESTION" | "MULTIPLE_CHOICE_QUESTION"

}

export const logCourses = ( courses: classroom_v1.Schema$Course[] ) => {

	console.table( courses, [ "name", "id" ] )
}

export const getCourses = async ( auth: any ) => {
	const classroom = google.classroom( { version: "v1", auth } )
	const courses = await classroom.courses.list( {
		courseStates: [ "ACTIVE" ],
		teacherId: "me",
		pageSize: 0,
	} )

	if ( courses.data ) {
		return courses.data.courses
	} else {
		console.error( "Classes.data.courses not found" )
	}
}

// export const chooseCoursePrompt = ( courses: classroom_v1.Schema$Course[] ) => {
// 	const readline = require( 'readline' ).createInterface( {
// 		input: process.stdin,
// 		output: process.stdout
// 	} )

// 	return new Promise( resolve => readline.question( '\nEnter the index of the course you would like to make an exam for >> ', ( ans: string ) => {
// 		const index = parseInt( ans )
// 		const name = courses[ index ].name
// 		console.log( `OK.  Let's make an exam for ${ name }!` )
// 		readline.close()
// 		resolve( index )
// 	} ) )
// }

// export const selectCourses = async ( courses: classroom_v1.Schema$Course[] ) => {
// 	let choices: number[] = []
// 	let loop = "y"
// 	while ( loop == "y" || loop == "yes" ) {
// 		let newChoices: number = await chooseCoursePrompt( courses ) as number
// 		choices.push( newChoices )
// 		loop = await askQuestion( "Would you like to add another course? (y/N) >> " ) as string
// 		if ( loop != "y" && loop != "yes" ) { loop = "N" }
// 	}
// 	return choices
// }

export const getRoster = ( auth: any, courseId: string ) => {
	// Get the roster for each class
	return google.classroom( { version: "v1", auth } ).courses.students.list( {
		courseId: courseId
	} )

}

export const getCourseRoster = ( auth: any, courses: classroom_v1.Schema$Course[], courseChoice: number ) => {
	return getRoster( courses[ courseChoice ].id as string, auth )
}

export const getAllRosters = async ( auth: any, courseChoices: number[], courses: classroom_v1.Schema$Course[] ) => {
	//////////////////////////////////
	// Method 1 - Reading in Series //
	//////////////////////////////////

	// let rosters: any = []

	// // Need to wait for this to finish before returning
	// // Have to use a for... of as forEach will not block the way you expect it.
	// // See https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop

	// for ( const courseChoice of courseChoices ) {
	// 	const ros = await getCourseRoster( courses, courseChoice, auth )
	// 	rosters.push( ros.data.students )
	// }

	// // Only return once ros actually has the data
	// return rosters

	////////////////////////////////////
	// Method 2 - Reading in Parallel //
	////////////////////////////////////

	// // await Promise.all ensures that we don't continue until ALL of the promises from the getCourseRoster() are fulfilled.  The map allows us to return an array of all the promises (which then promise.all waits for them all to be finished)
	// return await Promise.all(
	// 	courseChoices.map( async ( courseChoice ) => {
	// 		return await getCourseRoster( courses, courseChoice, auth )
	// 	} )
	// )
	// 	// After all the promises are finished, do this
	// 	// We are extracting the data we need from each object, instead of returning the entire object.
	// 	.then(
	// 		( res ) => res.map(
	// 			( roster ) => {
	// 				return roster.data.students
	// 			}
	// 		)
	// 	)

	///////////////////////////////////////////////////////
	// Method 3 - Reading in Parallel and preserve order //
	///////////////////////////////////////////////////////
	// https://stackoverflow.com/a/48939529

	const promises = courseChoices.map( ( courseChoice ) => { return getCourseRoster( auth, courses, courseChoice ) } )
	const contents = await Promise.all( promises )
	const rosters = contents.map( ( roster ) => roster.data.students )
	return rosters

}

export const getStudentsNamesFromRosters = ( rosters: any ) => {
	const students = []
	for ( const roster of rosters ) {
		if ( roster ) {
			for ( const student of roster ) {
				// What to do to each item
				students.push( student.profile?.name )
			}
		}
	}
	return students
}

export const postQuizAllStudentsCourse = ( auth: any, courseId: string, quizOptions: quizOptions ) => {

	google.classroom( { version: "v1", auth } ).courses.courseWork.create(
		{
			// Identifier of the course. This identifier can be either the Classroom-assigned identifier or an alias.
			courseId: courseId,

			// Request body metadata
			requestBody: {
				"assigneeMode": "ALL_STUDENTS", // ALL_STUDENTS or INDIVIDUAL_STUDENTS ---> If using INDIVIDUAL_STUDENTS, do individualStudentOptions
				"associatedWithDeveloper": false,
				"maxPoints": quizOptions.maxPoints,
				"state": "PUBLISHED",
				"submissionModificationMode": "MODIFIABLE_UNTIL_TURNED_IN",
				"title": quizOptions.title,
				"workType": "ASSIGNMENT"
			},
		}
	)
}

export const postQuizIndividualStudent = ( auth: any, courseId: string, quizOptions: quizOptions, studentIds: string[] ) => {

	google.classroom( { version: "v1", auth } ).courses.courseWork.create(
		{
			// Identifier of the course. This identifier can be either the Classroom-assigned identifier or an alias.
			courseId: courseId,

			// Request body metadata
			requestBody: {
				"assigneeMode": "INDIVIDUAL_STUDENTS", // ALL_STUDENTS or INDIVIDUAL_STUDENTS ---> If using INDIVIDUAL_STUDENTS, do individualStudentOptions
				"individualStudentsOptions": {
					studentIds: studentIds
				},
				"associatedWithDeveloper": false,
				"maxPoints": quizOptions.maxPoints,
				"state": "PUBLISHED",
				"submissionModificationMode": "MODIFIABLE_UNTIL_TURNED_IN",
				"title": quizOptions.title,
				"workType": "ASSIGNMENT"
			},
		}
	)
}
