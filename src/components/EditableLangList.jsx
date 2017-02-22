import React from 'react';
import ISO6391 from 'iso-639-1';

export default class EditableLangList extends React.Component {
	static propTypes = {
		langCodes: React.PropTypes.array,
		onAdd: React.PropTypes.func,
		onRemove: React.PropTypes.func,
	};

	static defaultProps = {
		langCodes: [],
		onAdd: () => {},
		onRemove: () => {},
	};

	addLang = (lang) => {
		this.props.onAdd(lang);
	};

	addItem = () => {
		this.props.onAdd(this.select.value);
		this.select.value = '';
	};

	render() {
		const languages = ISO6391.getLanguages(this.props.langCodes).map(lang => (
			<li key={lang.code}>
				<span
					style={{
						display: 'inline-block',
						minWidth: 200,
					}}
				>
					{lang.name}
				</span>
				<button className="btn btn-default btn-sm" onClick={() => this.props.onRemove(lang.code)}>X</button>
			</li>
		));

		const options = ISO6391.getAllNames()
			.map((lang) => {
				const code = ISO6391.getCode(lang);
				return <option key={code} value={code}>{lang}</option>;
			});

		return (
			<div
				style={{
					paddingBottom: 10,
				}}
			>
				<ul>
					{languages}
				</ul>
				<div className="row">
					<div className="col-lg-3">
						<div className="input-group">
							<select className="form-control" ref={(ref) => { this.select = ref; }}>
								{options}
							</select>
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
