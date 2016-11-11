import React from 'react';

function Panel({ title, children }) {
	return (
		<div className="panel panel-default">
			<div className="panel-heading">
				<h1 className="panel-title">{title}</h1>
			</div>
			<div className="panel-body">
				{children}
			</div>
		</div>
	);
}

Panel.propTypes = {
	title: React.PropTypes.string,
	children: React.PropTypes.node,
};

export default Panel;
