import React from 'react';

export default class EditableList extends React.Component {
	static propTypes = {
		id: React.PropTypes.string,
		label: React.PropTypes.string,
		checked: React.PropTypes.bool,
		onChange: React.PropTypes.func,
	};

	static defaultProps = {
		checked: false,
		onChange: () => {},
	};

	handleChange = (event) => {
		this.props.onChange(event.target.checked);
	};

	render() {
		return (
			<label
				className="checkbox"
				htmlFor={this.props.id}
			>
				<input
					id={this.props.id}
					type="checkbox"
					checked={this.props.checked}
					onChange={this.handleChange}
				/>
				{this.props.label}
			</label>
		);
	}
}
