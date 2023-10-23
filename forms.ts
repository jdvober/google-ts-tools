
import { Auth, forms_v1, google } from "googleapis"

interface Item {
	title: string
	description: string
	questionItem?: {
		question: {
			textQuestion: {
				paragraph: boolean
			}
		}
	}
	videoItem?: {
		caption: string,
		video: {
			properties: {
				alignment: "CENTER" | "LEFT" | "RIGHT",
				width: number
			},
			youtubeUri: string
		}
	},
	questionGroupItem?: {
		// TODO

		grid: {
			columns: {
				options: [
					{
						goToAction: "NEXT_SECTION" | "RESTART_FORM" | "SUBMIT_FORM"
					}
				]
			}
		}
	}
}
export const createForm = async ( auth: Auth.OAuth2Client, documentTitle: string = "TestForm", title: string = "TestForm" ) => {
	// export const createForm = async ( title: string, quizQuestions: forms_v1.Schema$Item[], auth: Auth.OAuth2Client ) => {
	const forms = await google.forms( { version: "v1", auth } )

	const form = await forms.forms.create( {
		requestBody: {
			info: {
				title: title,
				documentTitle: documentTitle
			}
		}
	} )
	return form.data.formId
}

export const addItems = ( items: forms_v1.Schema$Item[] ) => {
	return items.map( ( item, i ) => {
		return {
			createItem: {
				item: item,
				location: {
					index: i
				}

			}
		}
	} )
}

export const addQuestionsToForm = async ( auth: Auth.OAuth2Client, formId: string, items: forms_v1.Schema$Item[] ) => {
	const forms = await google.forms( { version: "v1", auth } )

	const form = await forms.forms.batchUpdate( {
		formId: formId,
		requestBody: {
			requests: addItems( items ),
			includeFormInResponse: true,
		}
	} )

	return form.data.form?.formId


}

export const addQuestionToForm = async ( auth: Auth.OAuth2Client, formId: string, item: forms_v1.Schema$Item, locationIndex: number = 0 ) => {
	const forms = await google.forms( { version: "v1", auth } )

	const form = await forms.forms.batchUpdate( {
		formId: formId,
		requestBody: {
			requests: [
				{
					createItem: {
						item: item,
						location: {
							index: locationIndex
						}

					},

				}
			]
		}
	} )

	return form.data.form?.formId

}

export const moveQuestion = async ( auth: Auth.OAuth2Client, formId: string, startingIndex: number, newIndex: number ) => {
	const forms = await google.forms( { version: "v1", auth } )
	const form = await forms.forms.batchUpdate( {
		formId: formId,
		requestBody: {
			requests: [
				{
					moveItem: {
						originalLocation: {
							index: startingIndex
						},
						newLocation: {
							index: newIndex
						}
					}
				}
			]
		}
	} )

	return form.data.form?.formId
}

export const makeImageItem = () => {

}

export const makePageBreakItem = () => {

}

export const makeQuestionGroupItem = ( title: string = "Quesion Title", description: string = "Question Description" ): Item => {
	return {
		title: title,
		description: description,
		questionGroupItem: {
			grid: {
				columns: {
					options: [
						{
							goToAction: "NEXT_SECTION"
						}
					]
				}
			}
		}
	}
}

export const makeQuestionItem = ( title: string = "Question Title", description: string = "Question Description", isParagraph: boolean = true ): Item => {
	return {
		title: title,
		description: description,
		questionItem: {
			question: {
				textQuestion: {
					paragraph: isParagraph
				}
			}
		}
	}
}

export const makeVideoItem = ( title: string = "Question Title", description: string = "Question Description", caption: string, youtubeUri: string ): Item => {
	return {
		title: title,
		description: description,
		videoItem: {
			caption: caption,
			video: {
				properties: {
					alignment: "CENTER",
					width: 0
				},
				youtubeUri: youtubeUri
			}
		},
	}
}

export const makeTextItem = () => {

}
