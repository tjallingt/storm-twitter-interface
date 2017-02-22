import React from 'react';

export default class Suggestions extends React.Component {
	static propTypes = {
		list: React.PropTypes.array,
		onRemove: React.PropTypes.func,
		onAccept: React.PropTypes.func,
	};

	static defaultProps = {
		list: [],
		onRemove: () => {},
		onAccept: () => {},
	};

	render() {
		const alerts = this.props.list.slice(0, 3).map(suggestion => (
			<div key={suggestion} className="alert alert-info">
				<button className="subtle-button" onClick={() => this.props.onAccept(suggestion)}>
					<strong>{suggestion} </strong>
					This keyword occurred frequently in the data stream, do you want to add it?
				</button>
				<button className="close" onClick={() => this.props.onRemove(suggestion)}>&times;</button>
			</div>
		));

		return (
			<div>
				{alerts}
			</div>
		);
	}
}
