import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Dropdown, { MenuItem } from '@trendmicro/react-dropdown';
import { reduxForm } from 'redux-form';
import {
    teamDelete,
    teamUpdateRole,
    resetTeamDelete,
} from '../../actions/team';
import { changeProjectRoles } from '../../actions/project';
import { TeamListLoader } from '../basic/Loader';
import ShouldRender from '../basic/ShouldRender';
import { User } from '../../config';
import { v4 as uuidv4 } from 'uuid';
import DataPathHoC from '../DataPathHoC';
import RemoveTeamUserModal from '../modals/RemoveTeamUserModal.js';
import { openModal, closeModal } from '../../actions/modal';
import { history } from '../../store';

import '@trendmicro/react-dropdown/dist/react-dropdown.css';
import { logEvent } from '../../analytics';
import { SHOULD_LOG_ANALYTICS } from '../../config';
import ConfirmChangeRoleModal from '../modals/ConfirmChangeRole';

export class TeamMember extends Component {
    constructor(props) {
        super(props);
        this.state = {
            removeUserModalId: uuidv4(),
            ConfirmationDialogId: uuidv4(),
        };
        this.removeTeamMember = this.removeTeamMember.bind(this);
        this.updateTeamMemberRole = this.updateTeamMemberRole.bind(this);
    }

    removeTeamMember(values) {
        const {
            resetTeamDelete,
            teamDelete,
            subProjectId,
            closeModal,
        } = this.props;
        teamDelete(subProjectId, values.userId).then(value => {
            if (!value.error) {
                resetTeamDelete();
                return closeModal({
                    id: this.state.removeUserModalId,
                });
            } else return null;
        });
        if (SHOULD_LOG_ANALYTICS) {
            logEvent(
                'EVENT: DASHBOARD > PROJECT > TEAM MEMBERS > TEAM MEMBER REMOVED',
                {
                    projectId: this.props.subProjectId,
                    userId: values.userId,
                }
            );
        }
    }

    updateTeamMemberRole(values, to) {
        const data = {};
        data.teamMemberId = values.userId;
        if (values.role === to) {
            return;
        } else {
            data.role = to;
        }
        const { changeProjectRoles } = this.props;
        this.props
            .teamUpdateRole(this.props.subProjectId, data)
            .then(team => changeProjectRoles(team.data));
        if (SHOULD_LOG_ANALYTICS) {
            logEvent(
                'EVENT: DASHBOARD > PROJECT > TEAM MEMBERS > ROLE CHANGED',
                {
                    projectId: this.props.subProjectId,
                    role: data.role,
                }
            );
        }
    }

    render() {
        const {
            handleSubmit,
            userId,
            deleting,
            team: { subProjectTeamMembers },
            updating,
        } = this.props;
        let teamMembers = subProjectTeamMembers.map(teamMembers => {
            return teamMembers.teamMembers;
        });
        teamMembers = teamMembers.flat();
        const loggedInUser = User.getUserId();
        const loggedInUserIsOwner = teamMembers.some(
            user => user.userId === loggedInUser && user.role === 'Owner'
        );

        const isOwner = teamMembers.find(
            user =>
                user.userId === loggedInUser &&
                user.role === 'Owner' &&
                user.name
        );
        const isAdmin = teamMembers.find(
            user =>
                user.userId === loggedInUser &&
                user.role === 'Administrator' &&
                user.name
        );

        return (
            <div
                className="bs-ObjectList-row db-UserListRow db-UserListRow--withName"
                id="added_team_members"
            >
                <div
                    className="bs-ObjectList-cell bs-u-v-middle"
                    id={`${this.props.email.split('@')[0]}-profile`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                        history.push('/dashboard/profile/' + this.props.userId);
                    }}
                >
                    <div className="bs-ObjectList-cell-row bs-ObjectList-copy bs-is-highlighted">
                        {this.props.name ? (
                            <span>
                                <img
                                    src="/dashboard/assets/img/profile-user.svg"
                                    className="userIcon"
                                    style={{ marginRight: '5px' }}
                                    alt=""
                                />
                                <span>
                                    {this.props.name ? this.props.name : ''}
                                </span>
                            </span>
                        ) : (
                            ''
                        )}
                        {!this.props.name && this.props.email ? (
                            <span>
                                <img
                                    src="/dashboard/assets/img/profile-user.svg"
                                    className="userIcon"
                                    style={{ marginRight: '5px' }}
                                    alt=""
                                />
                                <span>
                                    {this.props.email ? this.props.email : ''}
                                </span>
                            </span>
                        ) : (
                            ''
                        )}
                    </div>
                </div>
                <div className="bs-ObjectList-cell bs-u-v-middle">
                    <div
                        id={`${this.props.role}_${
                            this.props.email.split('@')[0]
                        }`}
                        className="bs-ObjectList-cell-row"
                    >
                        {this.props.role}
                    </div>
                </div>
                <div className="bs-ObjectList-cell bs-u-v-middle">
                    <div className="Badge Badge--color--green Box-root Flex-inlineFlex Flex-alignItems--center Padding-horizontal--8 Padding-vertical--2">
                        <span className="Badge-text Text-color--green Text-display--inline Text-fontSize--12 Text-fontWeight--bold Text-lineHeight--16 Text-typeface--upper Text-wrap--noWrap">
                            <span>
                                {this.props.name
                                    ? 'Online ' + this.props.lastActive
                                    : 'Invitation Sent'}
                            </span>
                        </span>
                    </div>
                </div>
                <div className="bs-ObjectList-cell bs-u-v-middle"></div>
                <div className="bs-ObjectList-cell bs-u-right bs-u-shrink bs-u-v-middle Flex-alignContent--spaceBetween">
                    <div>
                        <ShouldRender if={isAdmin || isOwner}>
                            <div className="Flex-flex Flex-alignContent--spaceBetween">
                                <Dropdown disabled={updating}>
                                    {!updating && (
                                        <Dropdown.Toggle
                                            id={`changeRole_${
                                                this.props.email.split('@')[0]
                                            }`}
                                            title="Change Role"
                                            className="bs-Button bs-DeprecatedButton"
                                        />
                                    )}
                                    {updating && (
                                        <button
                                            disabled={updating}
                                            className="bs-Button bs-DeprecatedButton Margin-left--8"
                                            type="button"
                                        >
                                            <TeamListLoader />
                                        </button>
                                    )}

                                    <Dropdown.Menu>
                                        <ShouldRender if={loggedInUserIsOwner}>
                                            <MenuItem
                                                title="Owner"
                                                onClick={handleSubmit(
                                                    values => {
                                                        this.props.openModal({
                                                            id: this.state
                                                                .ConfirmationDialogId,
                                                            content: DataPathHoC(
                                                                ConfirmChangeRoleModal,
                                                                {
                                                                    ConfirmationDialogId: this
                                                                        .state
                                                                        .ConfirmationDialogId,
                                                                    name:
                                                                        this
                                                                            .props
                                                                            .name ||
                                                                        this
                                                                            .props
                                                                            .email,
                                                                    values,
                                                                    role: this
                                                                        .props
                                                                        .role,
                                                                    userId: userId,
                                                                    newRole:
                                                                        'Owner',
                                                                    updating,
                                                                    updateTeamMemberRole: this
                                                                        .updateTeamMemberRole,
                                                                }
                                                            ),
                                                        });
                                                    }
                                                )}
                                            >
                                                Owner
                                            </MenuItem>
                                        </ShouldRender>
                                        <MenuItem
                                            title="Administrator"
                                            onClick={handleSubmit(values =>
                                                this.updateTeamMemberRole(
                                                    {
                                                        ...values,
                                                        role: this.props.role,
                                                        userId: userId,
                                                    },
                                                    'Administrator'
                                                )
                                            )}
                                        >
                                            Administrator
                                        </MenuItem>
                                        <MenuItem
                                            title="Member"
                                            onClick={handleSubmit(values =>
                                                this.updateTeamMemberRole(
                                                    {
                                                        ...values,
                                                        role: this.props.role,
                                                        userId: userId,
                                                    },
                                                    'Member'
                                                )
                                            )}
                                        >
                                            Member
                                        </MenuItem>
                                        <MenuItem
                                            title="Viewer"
                                            onClick={handleSubmit(values =>
                                                this.updateTeamMemberRole(
                                                    {
                                                        ...values,
                                                        role: this.props.role,
                                                        userId: userId,
                                                    },
                                                    'Viewer'
                                                )
                                            )}
                                        >
                                            Viewer
                                        </MenuItem>
                                    </Dropdown.Menu>
                                </Dropdown>
                                <button
                                    id={`removeMember__${
                                        this.props.email.split('@')[0]
                                    }`}
                                    title="delete"
                                    disabled={deleting}
                                    className="bs-Button bs-DeprecatedButton Margin-left--8"
                                    type="button"
                                    onClick={handleSubmit(values =>
                                        this.props.openModal({
                                            id: this.state.removeUserModalId,
                                            content: DataPathHoC(
                                                RemoveTeamUserModal,
                                                {
                                                    removeUserModalId: this
                                                        .state
                                                        .removeUserModalId,
                                                    values: {
                                                        ...values,
                                                        userId: userId,
                                                    },
                                                    displayName:
                                                        this.props.name ||
                                                        this.props.email,
                                                    removeTeamMember: this
                                                        .removeTeamMember,
                                                }
                                            ),
                                        })
                                    )}
                                >
                                    {!deleting && <span>Remove</span>}
                                </button>
                            </div>
                        </ShouldRender>
                    </div>
                </div>
            </div>
        );
    }
}

TeamMember.displayName = 'TeamMember';

TeamMember.propTypes = {
    changeProjectRoles: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    deleting: PropTypes.oneOf([null, false, true]),
    email: PropTypes.string.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    lastActive: PropTypes.string.isRequired,
    name: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.oneOf([null, undefined]),
    ]),
    openModal: PropTypes.func,
    resetTeamDelete: PropTypes.func.isRequired,
    role: PropTypes.string.isRequired,
    subProjectId: PropTypes.string.isRequired,
    team: PropTypes.object.isRequired,
    teamDelete: PropTypes.func.isRequired,
    teamUpdateRole: PropTypes.func.isRequired,
    updating: PropTypes.oneOf([null, false, true]),
    userId: PropTypes.string.isRequired,
};

const TeamMemberForm = reduxForm({
    form: 'TeamMember',
})(TeamMember);

const mapDispatchToProps = dispatch => {
    return bindActionCreators(
        {
            teamDelete,
            teamUpdateRole,
            changeProjectRoles,
            openModal,
            closeModal,
            resetTeamDelete,
        },
        dispatch
    );
};

function mapStateToProps(state, props) {
    return {
        team: state.team,
        deleting: state.team.teamdelete.deleting.some(
            id => id === props.userId
        ),
        updating: state.team.teamUpdateRole.updating.some(
            id => id === props.userId
        ),
        currentProject: state.project.currentProject,
        subProjects: state.subProject.subProjects.subProjects,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamMemberForm);
