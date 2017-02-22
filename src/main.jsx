import React from 'react';
import ReactDOM from 'react-dom';

import io from 'socket.io-client';
import EditableList from './components/EditableList';
import EditableLangList from './components/EditableLangList';
import EditableUserList from './components/EditableUserList';
import Panel from './components/Panel';
import TweetList from './components/TweetList';
import CheckBox from './components/CheckBox';
import Suggestions from './components/Suggestions';


export default class Main extends React.Component {
	constructor(props) {
		super(props);
		this.socket = io.connect(window.location.origin);
		this.socket.on('update-settings', (settings) => {
			this.setState({ settings });
			console.log(settings);
		});
		this.socket.on('update-data', (data) => {
			this.setState({ data });
		});
	}

	state = {
		data: {
			removed: [],
		},
		settings: {
			blacklist: {},
			filter: {},
			status: {},
		},
	};

	alterSetting = (key, action) => (value) => {
		this.socket.emit('alter-setting', { key, action, value });
		console.log(key, action, value);
	};

	alterData = (key, action) => (value) => {
		this.socket.emit('alter-data', { key, action, value });
	};

	handleSuggestionAccept = (suggestion) => {
		if (suggestion.startsWith('#')) {
			this.socket.emit('alter-setting', {
				key: 'settings:filter:track',
				action: 'add',
				value: suggestion,
			});
		} else if (suggestion.startsWith('@')) {
			fetch(`/api/users/show?screen_name=${suggestion.substring(1)}`)
				.then(response => response.json())
				.then((user) => {
					if (user.name === suggestion.substring(1) && user.id) {
						this.socket.emit('alter-setting', {
							key: 'settings:filter:follow',
							action: 'add',
							value: user.id,
						});
					}
				})
				.catch(console.error);
		}
		this.socket.emit('alter-data', {
			key: 'data:analysis:keywords',
			action: 'remove',
			value: suggestion,
		});
	};

	updateFilter = () => {
		this.socket.emit('update-filter');
		this.button.disabled = true;
		setTimeout(() => {
			this.button.disabled = false;
		}, 30000);
	};

	render() {
		return (
			<div>
				<div className="row">
					<div className="col-lg-12">
						<Panel title="Twitter Data Stream Settings">
							<h3>Track</h3>
							<EditableList
								list={this.state.settings.filter.track}
								onAdd={this.alterSetting('settings:filter:track', 'add')}
								onRemove={this.alterSetting('settings:filter:track', 'remove')}
							/>
							<h3>Follow</h3>
							<EditableUserList
								userIds={this.state.settings.filter.follow}
								onAdd={this.alterSetting('settings:filter:follow', 'add')}
								onRemove={this.alterSetting('settings:filter:follow', 'remove')}
							/>
							<Suggestions
								list={this.state.data.keywords}
								onAccept={this.handleSuggestionAccept}
								onRemove={this.alterData('data:analysis:keywords', 'remove')}
							/>
							<button
								className="btn btn-primary"
								ref={(ref) => { this.button = ref; }}
								onClick={this.updateFilter}
							>
								Update Twitter filter
							</button>
						</Panel>
					</div>
				</div>
				<div className="row">
					<div className="col-lg-12">
						<Panel title="Twitter Status Filter">
							<h3>Languages</h3>
							<p>A whitelist of allowed languages.</p>
							<EditableLangList
								langCodes={this.state.settings.status.languages}
								onAdd={this.alterSetting('settings:status:languages', 'add')}
								onRemove={this.alterSetting('settings:status:languages', 'remove')}
							/>
							<h3>Retweets</h3>
							<CheckBox
								id="retweets"
								label="Hide retweets"
								checked={this.state.settings.status.retweets}
								onChange={this.alterSetting('settings:status:retweets', 'set')}
							/>
							<h3>Potentially sensitive</h3>
							<CheckBox
								id="sensitive"
								label="Hide potentially sensitive tweets"
								checked={this.state.settings.status.sensitive}
								onChange={this.alterSetting('settings:status:sensitive', 'set')}
							/>
						</Panel>
					</div>
				</div>
				<div className="row">
					<div className="col-lg-12">
						<Panel title="Blacklist Filter">
							<h3>Words</h3>
							<p>A blacklist of disallowed words.</p>
							<EditableList
								list={this.state.settings.blacklist.words}
								onAdd={this.alterSetting('settings:blacklist:words', 'add')}
								onRemove={this.alterSetting('settings:blacklist:words', 'remove')}
							/>
							<h3>Users</h3>
							<p>A blacklist of disallowed users.</p>
							<EditableUserList
								userIds={this.state.settings.blacklist.users}
								onAdd={this.alterSetting('settings:blacklist:users', 'add')}
								onRemove={this.alterSetting('settings:blacklist:users', 'remove')}
							/>
						</Panel>
					</div>
				</div>
				<div className="row">
					<div className="col-lg-12">
						<Panel title="Removed Tweets" childHasBody>
							<div className="panel-body">
								This is a list of removed tweets that can be used to
								get an impression of the effects of the current filter settings.
							</div>
							<TweetList tweets={this.state.data.removed} />
						</Panel>
					</div>
				</div>
			</div>
		);
	}
}

ReactDOM.render(
	<Main />,
	document.getElementById('app')
);
