import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UptimeLegend from './UptimeLegend';
import NoMonitor from './NoMonitor';
import UptimeGraphs from './UptimeGraphs';
import ShouldRender from './ShouldRender';
import Footer from './Footer';
import NotesMain from './NotesMain';
import { API_URL, ACCOUNTS_URL, getServiceStatus } from '../config';
import moment from 'moment';
import { Helmet } from 'react-helmet';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getStatusPage, fetchMonitorStatuses, getStatusPageIndividualNote, selectedProbe } from '../actions/status';
import { getProbes } from '../actions/probe';


class Main extends Component {

	componentDidMount() {
		if (window.location.search.substring(1) && window.location.search.substring(1) === 'embedded=true') {
			document.getElementsByTagName('html')[0].style.background = 'none transparent';
		}

		let projectId, url;
		if (window.location.href.indexOf('localhost') > -1 || window.location.href.indexOf('fyipeapp.com') > 0) {
			projectId = window.location.host.split('.')[0];
			url = 'null';
		} else {
			projectId = 'null';
			url = window.location.host;
		}

		this.props.getProbes(projectId, 0, 10).then(() => {
			this.selectbutton(this.props.activeProbe)
		});

		this.props.getStatusPage(projectId, url).then(() => {
			this.props.monitorState.forEach(monitor => {
				const endDate = moment(Date.now());
				const startDate = moment(Date.now()).subtract(90, 'days');
				this.props.fetchMonitorStatuses(monitor.projectId._id || monitor.projectId, monitor._id, startDate, endDate);
			});
		}).catch(err => {
			if (err.message === 'Request failed with status code 401') {
				const { loginRequired } = this.props.login;
				if (loginRequired) {
					window.location = `${ACCOUNTS_URL}/login?statusPage=true&statusPageURL=${window.location.href}`;
				}
			}
		})
	}

	groupBy(collection, property) {
		var i = 0, val, index,
			values = [], result = [];
		for (; i < collection.length; i++) {
			val = collection[i][property] ? collection[i][property]['name'] : 'no-category';
			index = values.indexOf(val);
			if (index > -1)
				result[index].push(collection[i]);
			else {
				values.push(val);
				result.push([collection[i]]);
			}
		}
		return result;
	}

	groupedMonitors = () => {
		if (this.props.statusData && this.props.statusData.monitorIds !== undefined && this.props.statusData.monitorIds.length > 0) {
			let monitorData = this.props.statusData.monitorIds;
			let groupedMonitorData = this.groupBy(monitorData, 'monitorCategoryId')
			let monitorCategoryStyle = {
				display: 'inline-block',
				marginBottom: 10,
				fontSize: 10,
				color: '#8898aa',
				fontWeight: 'Bold'
			}
			let monitorCategoryGroupContainerStyle = {
				marginBottom: 40
			}
			return groupedMonitorData.map((groupedMonitors, i) => {
				return (
					<div key={i} style={monitorCategoryGroupContainerStyle} className="uptime-graph-header">
						<div id={`monitorCategory${i}`} style={monitorCategoryStyle}>
							<span>{groupedMonitors[0].monitorCategoryId ? groupedMonitors[0].monitorCategoryId.name.toUpperCase() : 'Uncategorized'.toUpperCase()}</span>
						</div>
						{groupedMonitors.map((monitor, i) => {
							return (<UptimeGraphs monitor={monitor} key={i} id={`monitor${i}`} />)
						})}
					</div>
				)
			})
		} else {
			return <NoMonitor />
		}
	}

	selectbutton = (index) => {
		this.props.selectedProbe(index);
	}

	renderError = () => {
		let { error } = this.props.status;
		if (error === 'Input data schema mismatch.') {
			return 'StatusPage Not present';
		} else if (error === 'Project Not present') {
			return 'Invalid Project.';
		} else return error;
	}

	render() {
		const probes = this.props.probes || [];
		const date = new Date();
		let view = false;
		let status = '';
		let serviceStatus = '';
		let statusMessage = '';
		let faviconurl = '';
		let isGroupedByMonitorCategory = false;
		let error = this.renderError();

		if (this.props.statusData && this.props.statusData.monitorIds) {
			serviceStatus = getServiceStatus(this.props.monitorState, probes);
			isGroupedByMonitorCategory = this.props.statusData.isGroupedByMonitorCategory;
			var colors = this.props.statusData.colors

			if (serviceStatus === 'all') {
				status = 'status-bubble status-up';
				statusMessage = 'All services are online';
				faviconurl = '/greenfavicon.ico';
			}
			else if (serviceStatus === 'none') {
				status = 'status-bubble status-down';
				statusMessage = 'All services are offline';
				faviconurl = '/redfavicon.ico';
			}
			else if (serviceStatus === 'some') {
				status = 'status-bubble status-paused';
				statusMessage = 'Some services are offline';
				faviconurl = '/yellowfavicon.ico';
			}
			view = true;

			var greenBackground = {
				display: 'inline-block',
				borderRadius: '50%',
				height: '8px',
				width: '8px',
				margin: '0 8px 1px 0',
				backgroundColor: 'rgb(117, 211, 128)'// "green-status"
			}
			var yellowBackground = {
				display: 'inline-block',
				borderRadius: '50%',
				height: '8px',
				width: '8px',
				margin: '0 8px 1px 0',
				backgroundColor: 'rgb(255, 222, 36)'// "yellow-status"
			}
			var redBackground = {
				display: 'inline-block',
				borderRadius: '50%',
				height: '8px',
				width: '8px',
				margin: '0 8px 1px 0',
				backgroundColor: 'rgb(250, 117, 90)'// "red-status"
			}
			var heading = {
				color: `rgba(${ colors.heading.r }, ${ colors.heading.g }, ${ colors.heading.b }, ${ colors.heading.a })`
			}
			var backgroundMain = {
				background: `rgba(${ colors.pageBackground.r }, ${ colors.pageBackground.g }, ${ colors.pageBackground.b }, ${ colors.pageBackground.a })`
			}
			var contentBackground = {
				background: `rgba(${ colors.statusPageBackground.r }, ${ colors.statusPageBackground.g }, ${ colors.statusPageBackground.b }, ${ colors.statusPageBackground.a })`
			}
		}

		return (
			<div style={backgroundMain}>
				{this.props.statusData && this.props.statusData.bannerPath ? <span><img src={`${API_URL}/file/${this.props.statusData.bannerPath}`} alt="" className="banner" /></span> : ''}
				{view ? <div className="innernew">
					<div className="header clearfix">
						<div className="heading">
							{this.props.statusData && this.props.statusData.logoPath ? <span><img src={`${API_URL}/file/${this.props.statusData.logoPath}`} alt="" className="logo" /></span> : ''}
						</div>
					</div>
					<div className="content">
						<div className="white box">
							<div className="largestatus">
								<span className={status}></span>
								<div className="title-wrapper">
									<span className="title" style={heading}>{statusMessage}</span>
									<label className="status-time">
										As of <span className="current-time">{moment(date).format('LLLL')}</span>
									</label>
								</div>
							</div>
							<div className="btn-group">
								{probes.map((probe, index) =>
									(<button
										onClick={() => this.selectbutton(index)}
										style={contentBackground}
										key={`probes-btn${index}`}
										id={`probes-btn${index}`}
										className={this.props.activeProbe === index ? 'icon-container selected' : 'icon-container'}>
										<span style={probe.status === 'online' ? greenBackground : probe.status === 'degraded' ? yellowBackground : redBackground}></span>
										<span>{probe.probeName}</span>
									</button>)
								)}
							</div>
							<div className="statistics" style={contentBackground}>
								<div className="inner-gradient"></div>
								<div className="uptime-graphs box-inner">
									{isGroupedByMonitorCategory ?
										this.groupedMonitors() :
										(this.props.statusData &&
											this.props.statusData.monitorIds !== undefined &&
											this.props.statusData.monitorIds.length > 0 ?
											this.props.statusData.monitorIds
												.map((monitor, i) =>
													<UptimeGraphs monitor={monitor} key={i} id={`monitor${i}`} />) :
											<NoMonitor />)}
								</div>
								{this.props.statusData && this.props.statusData.monitorIds !== undefined && this.props.statusData.monitorIds.length > 0 ?<UptimeLegend background={contentBackground}/>: ''}
							</div>
						</div>
					</div>
					<Helmet>
						{this.props.statusData && this.props.statusData.faviconPath ? <link rel="shortcut icon" href={`${API_URL}/file/${this.props.statusData.faviconPath}`} /> : <link rel="shortcut icon" href={faviconurl} />}
						<title>{this.props.statusData && this.props.statusData.title ? this.props.statusData.title : 'Status page'}</title>
						<script src="/js/landing.base.js" type="text/javascript"></script>
					</Helmet>
					<ShouldRender if={this.props.statusData && this.props.statusData.projectId && this.props.statusData._id}>
						<NotesMain projectId={this.props.statusData.projectId._id} statusPageId={this.props.statusData._id} />
					</ShouldRender>
					<div id="footer">
						<ul>
							<ShouldRender if={this.props.statusData && this.props.statusData.copyright}>
								<li> <span>&copy;</span> {this.props.statusData && this.props.statusData.copyright ? this.props.statusData.copyright : ''}</li>
							</ShouldRender>
							<ShouldRender if={this.props.statusData && this.props.statusData.links && (this.props.statusData.links).length}>
								{this.props.statusData && this.props.statusData.links && this.props.statusData.links.map((link, i) => <Footer link={link} key={i} />)}
							</ShouldRender>
						</ul>

						<p><a href="https://fyipe.com" target="_blank" rel="noopener noreferrer">Powered by Fyipe</a></p>
					</div>
				</div> : ''}

				<ShouldRender if={this.props.status && this.props.status.requesting}>
					<div> error</div>
					<div
						id="app-loading"
						style={{
							'position': 'fixed',
							'top': '0',
							'bottom': '0',
							'left': '0',
							'right': '0',
							'backgroundColor': '#fdfdfd',
							'zIndex': '999',
							'display': 'flex',
							'justifyContent': 'center',
							'alignItems': 'center'
						}}
					>
						<div style={{ 'transform': 'scale(2)' }}>
							<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="bs-Spinner-svg">
								<ellipse cx="12" cy="12" rx="10" ry="10" className="bs-Spinner-ellipse"></ellipse>
							</svg>
						</div>
					</div>
				</ShouldRender>
				<ShouldRender if={error}>
					<div id="app-loading">
						<div>{error}</div>
					</div>
				</ShouldRender>
			</div>
		);
	}
}

Main.displayName = 'Main';

const mapStateToProps = (state) => ({
	status: state.status,
	statusData: state.status.statusPage,
	login: state.login,
	activeProbe: state.status.activeProbe,
	monitorState: state.status.statusPage.monitorsData,
	probes: state.probe.probes
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
	getStatusPage,
	fetchMonitorStatuses,
	getProbes,
	getStatusPageIndividualNote,
	selectedProbe
}, dispatch);

Main.propTypes = {
	statusData: PropTypes.object,
	status: PropTypes.object,
	getStatusPage: PropTypes.func,
	fetchMonitorStatuses: PropTypes.func,
	getProbes: PropTypes.func,
	login: PropTypes.object.isRequired,
	monitorState: PropTypes.array,
	selectedProbe: PropTypes.func,
	activeProbe: PropTypes.number,
	probes: PropTypes.array
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);