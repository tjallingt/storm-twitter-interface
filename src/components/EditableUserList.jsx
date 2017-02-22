import React from 'react';
import 'whatwg-fetch';

import debounce from 'lodash.debounce';

export default class EditableUserList extends React.Component {
	static propTypes = {
		userIds: React.PropTypes.array,
		onAdd: React.PropTypes.func,
		onRemove: React.PropTypes.func,
	};

	static defaultProps = {
		userIds: [],
		onAdd: () => {},
		onRemove: () => {},
	};

	constructor(props) {
		super(props);
		this.search = debounce(this.search, 500);
	}

	state = {
		search: '',
		results: [],
		users: [],
	};

	componentWillReceiveProps(nextProps) {
		if (nextProps.userIds === 'undefined' || nextProps.userIds.length === 0) {
			this.setState({ users: [] });
			return;
		}
		// filter out any ids from nextProps.userIds that are also in this.props.userIds
		const newUserIds = nextProps.userIds.filter(userId => !this.props.userIds.includes(userId));
		// check if the were props changed
		if (this.props.userIds.length === nextProps.userIds.length && newUserIds.length === 0) {
			return;
		}
		// filter all users from the current state that are also in the nextProps.userIds
		const currentUsers = this.state.users.filter(user => nextProps.userIds.includes(user.id));
		// check if the user data is cached to prevent unnecisairy web requests
		const unknownUserIds = !this.lastAddedUser ? newUserIds : newUserIds.filter((id) => {
			if (id === this.lastAddedUser.id) {
				currentUsers.push(this.lastAddedUser);
				this.lastAddedUser = null;
				return false;
			}
			return true;
		});
		if (unknownUserIds.length === 0) {
			this.setState({ users: currentUsers });
			return;
		}
		fetch(`/api/users/lookup?user_id=${unknownUserIds.join()}`)
			.then(response => response.json())
			.then(users => [...users, ...currentUsers])
			.then(users => this.setState({ users }))
			.catch(console.error);
	}

	addUser = (user) => {
		this.lastAddedUser = user;
		this.props.onAdd(user.id);
		this.setState({
			search: '',
			results: [],
		});
	};

	handleChange = (event) => {
		this.setState({ search: event.target.value });
		this.search(event.target.value);
	};

	search = (query) => {
		if (!query) {
			this.setState({ results: [] });
			return;
		}
		fetch(`/api/users/search?q=${query}`)
			.then(response => response.json())
			.then(results => this.setState({ results }))
			.catch(console.error);
	}

	render() {
		const users = this.state.users.map(user => (
			<li key={user.id}>
				<span
					style={{
						display: 'inline-block',
						minWidth: 200,
					}}
				>
					@{user.name}
				</span>
				<button className="btn btn-default btn-sm" onClick={() => this.props.onRemove(user.id)}>X</button>
			</li>
		));
		const results = this.state.results
			.filter(user => !this.props.userIds.includes(user.id))
			.map(user => (
				<li key={user.id}>
					<a href="#addUser" onClick={() => this.addUser(user)}>@{user.name}</a>
				</li>
			));

		return (
			<div
				style={{
					paddingBottom: 10,
				}}
			>
				<ul>
					{users}
				</ul>
				<div className="row">
					<div className="col-lg-3">
						<div className="suggestion-group">
							<input
								className="form-control"
								type="text"
								value={this.state.search}
								onChange={this.handleChange}
							/>
							<ul className={`suggestions ${results.length !== 0 ? 'open' : ''}`}>
								{results}
							</ul>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
