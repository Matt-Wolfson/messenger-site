import { ErrorService } from './../errors/error.service';
import { Http, Response, Headers } from "@angular/http";
import { Injectable, EventEmitter } from "@angular/core";
import 'rxjs/Rx';
import { Observable } from 'rxjs';

import { Message } from "./message.model";

@Injectable()
export class MessageService {
	private messages: Message[] = [];
	messageIsEdit = new EventEmitter;

	constructor(private http: Http, private errorService: ErrorService) {}

	addMessage(message: Message) {
		const body = JSON.stringify(message);
		const headers = new Headers({'Content-Type': 'application/json'});
		const token = localStorage.getItem('token') 
				? '?token=' + localStorage.getItem('token') 
				: '';
		return this.http.post('http://localhost:3000/message' + token, body, {headers: headers})
			.map((response: Response) => {
				const result = response.json();
				const message = new Message(
					result.obj.content, 
					result.obj.user.firstName, 
					result.obj._id, 
					result.obj.user._id
				);
				this.messages.push(message);
				return message;
			})
			.catch((error: Response) => {
				this.errorService.handleError(error.json());
				return Observable.throw(error.json());
			});
			
	}

	getMessages() {
		return this.http.get('http://localhost:3000/message')
			.map((response: Response) => {
				const messages = response.json().obj;
				let transformedMessages: Message[] = [];
				console.log(messages);
				for (let message of messages) {
					transformedMessages.push(new Message(
						message.content, 
						message.user ? message.user.firstName : null, 
						message._id, 
						message.user ? message.user._id : null
					));
				}
				this.messages = transformedMessages;
				return transformedMessages;
			})
			.catch((error: Response) => {
				console.log(error);
				this.errorService.handleError(error.json());
				return Observable.throw(error.json());
			});
	}

	editMessage(message: Message) {
		this.messageIsEdit.emit(message);
	}

	updateMessage(message: Message) {
		const body = JSON.stringify(message);
		const headers = new Headers({'Content-Type': 'application/json'});
		const token = localStorage.getItem('token') 
			? '?token=' + localStorage.getItem('token') 
			: '';
		return this.http.patch('http://localhost:3000/message/' + message.messageId + token, body, {headers: headers})
			.map((response: Response) => response.json())
			.catch((error: Response) => {
				this.errorService.handleError(error.json());
				return Observable.throw(error.json());
			});
	}

	deleteMessage(message: Message) {
		this.messages.splice(this.messages.indexOf(message), 1);
		const token = localStorage.getItem('token') 
			? '?token=' + localStorage.getItem('token') 
			: '';
		return this.http.delete('http://localhost:3000/message/' + message.messageId + token)
			.map((response: Response) => response.json())
			.catch((error: Response) => {
				this.errorService.handleError(error.json());
				return Observable.throw(error.json());
			});
	}
}