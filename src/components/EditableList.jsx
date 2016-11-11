import React from 'react';

export default class EditableList extends React.Component {
	static propTypes = {
		list: React.PropTypes.array,
		onAdd: React.PropTypes.func,
		onRemove: React.PropTypes.func,
	};

	static defaultProps = {
		list: [],
		onAdd: () => {},
		onRemove: () => {},
	};

	addItem = () => {
		this.props.onAdd(this.input.value);
		this.input.value = '';
	};

	render() {
		const list = [];
		this.props.list.forEach((item, index) => {
			list.push(
				<li key={index}>
					<span
						style={{
							display: 'inline-block',
							width: 200,
						}}
					>
						{item}
					</span>
					<button className="btn btn-default btn-sm" onClick={() => this.props.onRemove(item, index)}>X</button>
				</li>
			);
		});

		return (
			<div
				style={{
					paddingBottom: 10,
				}}
			>
				<ul>
					{list}
				</ul>
				<div className="row">
					<div className="col-lg-3">
						<div className="input-group">
							<input className="form-control" type="text" ref={(ref) => { this.input = ref; }} />
							<span className="input-group-btn">
								<button className="btn btn-default" onClick={this.addItem}>Add</button>
							</span>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
