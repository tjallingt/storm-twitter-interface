import React from 'react';
import ReactDOM from 'react-dom';

import io from 'socket.io-client';
import EditableList from './components/EditableList';
import EditableUserList from './components/EditableUserList';
import Panel from './components/Panel';
import TweetList from './components/TweetList';


export default class Main extends React.Component {
	constructor(props) {
		super(props);
		this.socket = io.connect(window.location.origin);
		this.socket.on('update-settings', (settings) => {
			this.setState({ settings });
			console.log(settings);
		});
		this.socket.on('filterList', (data) => {
			this.setState({ filterList: data });
		});
	}

	state = {
		filterList: [],
		settings: {
			blacklist: {},
			filter: {},
		},
	};

	alterSetting = setting => (value) => {
		this.socket.emit('alter-setting', { setting, value });
		console.log(setting, value);
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
						<Panel title="Twitter Filter">
							<h3>Track</h3>
							<EditableList
								list={this.state.settings.filter.track}
								onAdd={this.alterSetting('add:filter:track')}
								onRemove={this.alterSetting('remove:filter:track')}
							/>
							<h3>Follow</h3>
							<EditableUserList
								userIds={this.state.settings.filter.follow}
								onAdd={this.alterSetting('add:filter:follow')}
								onRemove={this.alterSetting('remove:filter:follow')}
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
						<Panel title="Blacklist">
							<h3>Words</h3>
							<EditableList
								list={this.state.settings.blacklist.words}
								onAdd={this.alterSetting('add:blacklist:word')}
								onRemove={this.alterSetting('remove:blacklist:word')}
							/>
							<h3>Users</h3>
							<EditableUserList
								userIds={this.state.settings.blacklist.users}
								onAdd={this.alterSetting('add:blacklist:user')}
								onRemove={this.alterSetting('remove:blacklist:user')}
							/>
						</Panel>
					</div>
				</div>
				<div className="row">
					<div className="col-lg-12">
						<Panel title="FilterList">
							<TweetList tweets={this.state.filterList} />
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
