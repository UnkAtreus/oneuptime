import React, { Fragment, FunctionComponent, ReactElement } from 'react';
import PageComponentProps from '../../PageComponentProps';
import FieldType from 'CommonUI/src/Components/Types/FieldType';
import FormFieldSchemaType from 'CommonUI/src/Components/Forms/Types/FormFieldSchemaType';
import CardModelDetail from 'CommonUI/src/Components/ModelDetail/CardModelDetail';
import Navigation from 'CommonUI/src/Utils/Navigation';
import { JSONObject } from 'Common/Types/JSON';
import ObjectID from 'Common/Types/ObjectID';
import BadDataException from 'Common/Types/Exception/BadDataException';
import Incident from 'Model/Models/Incident';
import Pill from 'CommonUI/src/Components/Pill/Pill';
import MonitorsElement from '../../../Components/Monitor/Monitors';
import IncidentStateTimeline from 'Model/Models/IncidentStateTimeline';
import ModelAPI, { ListResult } from 'CommonUI/src/Utils/ModelAPI/ModelAPI';
import ChangeIncidentState, {
    IncidentType,
} from '../../../Components/Incident/ChangeState';
import BaseModel from 'Common/Models/BaseModel';
import IncidentSeverity from 'Model/Models/IncidentSeverity';
import Label from 'Model/Models/Label';
import LabelsElement from '../../../Components/Label/Labels';
import GlobalEvent from 'CommonUI/src/Utils/GlobalEvents';
import EventName from '../../../Utils/EventName';
import OnCallDutyPoliciesView from '../../../Components/OnCallPolicy/OnCallPolicies';
import { LIMIT_PER_PROJECT } from 'Common/Types/Database/LimitMax';
import CheckboxViewer from 'CommonUI/src/Components/Checkbox/CheckboxViewer';
import { VoidFunction } from 'Common/Types/FunctionTypes';
import { Black } from 'Common/Types/BrandColors';

const IncidentView: FunctionComponent<PageComponentProps> = (
    _props: PageComponentProps
): ReactElement => {
    const modelId: ObjectID = Navigation.getLastParamAsObjectID();

    return (
        <Fragment>
            {/* Incident View  */}
            <CardModelDetail<Incident>
                name="Incident Details"
                cardProps={{
                    title: 'Incident Details',
                    description: 'Here are more details for this incident.',
                }}
                isEditable={true}
                formSteps={[
                    {
                        title: 'Incident Details',
                        id: 'incident-details',
                    },
                    {
                        title: 'Labels',
                        id: 'labels',
                    },
                ]}
                formFields={[
                    {
                        field: {
                            title: true,
                        },
                        title: 'Incident Title',
                        stepId: 'incident-details',
                        fieldType: FormFieldSchemaType.Text,
                        required: true,
                        placeholder: 'Incident Title',
                        validation: {
                            minLength: 2,
                        },
                    },

                    {
                        field: {
                            incidentSeverity: true,
                        },
                        title: 'Incident Severity',
                        description: 'What type of incident is this?',
                        fieldType: FormFieldSchemaType.Dropdown,
                        stepId: 'incident-details',
                        dropdownModal: {
                            type: IncidentSeverity,
                            labelField: 'name',
                            valueField: '_id',
                        },
                        required: true,
                        placeholder: 'Incident Severity',
                    },
                    {
                        field: {
                            labels: true,
                        },
                        title: 'Labels ',
                        stepId: 'labels',
                        description:
                            'Team members with access to these labels will only be able to access this resource. This is optional and an advanced feature.',
                        fieldType: FormFieldSchemaType.MultiSelectDropdown,
                        dropdownModal: {
                            type: Label,
                            labelField: 'name',
                            valueField: '_id',
                        },
                        required: false,
                        placeholder: 'Labels',
                    },
                ]}
                modelDetailProps={{
                    onBeforeFetch: async (): Promise<JSONObject> => {
                        // get ack incident.

                        const incidentTimelines: ListResult<IncidentStateTimeline> =
                            await ModelAPI.getList({
                                modelType: IncidentStateTimeline,
                                query: {
                                    incidentId: modelId,
                                },
                                limit: LIMIT_PER_PROJECT,
                                skip: 0,
                                select: {
                                    _id: true,

                                    createdAt: true,
                                    createdByUser: {
                                        name: true,
                                        email: true,
                                        profilePictureId: true,
                                    },
                                    incidentState: {
                                        name: true,
                                        isResolvedState: true,
                                        isAcknowledgedState: true,
                                    },
                                },
                                sort: {},
                            });

                        return incidentTimelines;
                    },
                    showDetailsInNumberOfColumns: 2,
                    modelType: Incident,
                    id: 'model-detail-incidents',
                    fields: [
                        {
                            field: {
                                _id: true,
                            },
                            title: 'Incident ID',
                            fieldType: FieldType.ObjectID,
                        },
                        {
                            field: {
                                title: true,
                            },
                            title: 'Incident Title',
                            fieldType: FieldType.Text,
                        },

                        {
                            field: {
                                currentIncidentState: {
                                    color: true,
                                    name: true,
                                },
                            },
                            title: 'Current State',
                            fieldType: FieldType.Entity,
                            getElement: (item: Incident): ReactElement => {
                                if (!item['currentIncidentState']) {
                                    throw new BadDataException(
                                        'Incident Status not found'
                                    );
                                }

                                return (
                                    <Pill
                                        color={
                                            item.currentIncidentState.color ||
                                            Black
                                        }
                                        text={
                                            item.currentIncidentState.name ||
                                            'Unknown'
                                        }
                                    />
                                );
                            },
                        },
                        {
                            field: {
                                incidentSeverity: {
                                    color: true,
                                    name: true,
                                },
                            },
                            title: 'Incident Severity',
                            fieldType: FieldType.Entity,
                            getElement: (item: Incident): ReactElement => {
                                if (!item['incidentSeverity']) {
                                    throw new BadDataException(
                                        'Incident Severity not found'
                                    );
                                }

                                return (
                                    <Pill
                                        color={
                                            item.incidentSeverity.color || Black
                                        }
                                        text={
                                            item.incidentSeverity.name ||
                                            'Unknown'
                                        }
                                    />
                                );
                            },
                        },
                        {
                            field: {
                                monitors: {
                                    name: true,
                                    _id: true,
                                },
                            },
                            title: 'Monitors Affected',
                            fieldType: FieldType.Element,
                            getElement: (item: Incident): ReactElement => {
                                return (
                                    <MonitorsElement
                                        monitors={item['monitors'] || []}
                                    />
                                );
                            },
                        },
                        {
                            field: {
                                onCallDutyPolicies: {
                                    name: true,
                                    _id: true,
                                },
                            },
                            title: 'On-Call Duty Policies',
                            fieldType: FieldType.Element,
                            getElement: (item: Incident): ReactElement => {
                                return (
                                    <OnCallDutyPoliciesView
                                        onCallPolicies={
                                            item.onCallDutyPolicies || []
                                        }
                                    />
                                );
                            },
                        },
                        {
                            field: {
                                createdAt: true,
                            },
                            title: 'Created At',
                            fieldType: FieldType.DateTime,
                        },
                        {
                            field: {
                                shouldStatusPageSubscribersBeNotifiedOnIncidentCreated:
                                    true,
                            },
                            title: 'Notify Status Page Subscribers',
                            fieldType: FieldType.Boolean,
                            getElement: (item: Incident): ReactElement => {
                                return (
                                    <div className="">
                                        <CheckboxViewer
                                            isChecked={
                                                item[
                                                    'shouldStatusPageSubscribersBeNotifiedOnIncidentCreated'
                                                ] as boolean
                                            }
                                            text={
                                                item[
                                                    'shouldStatusPageSubscribersBeNotifiedOnIncidentCreated'
                                                ]
                                                    ? 'Subscribers Notified'
                                                    : 'Subscribers Not Notified'
                                            }
                                        />{' '}
                                    </div>
                                );
                            },
                        },
                        {
                            field: {
                                labels: {
                                    name: true,
                                    color: true,
                                },
                            },
                            title: 'Labels',
                            fieldType: FieldType.Element,
                            getElement: (item: Incident): ReactElement => {
                                return (
                                    <LabelsElement
                                        labels={item['labels'] || []}
                                    />
                                );
                            },
                        },
                        {
                            title: 'Acknowledge Incident',
                            fieldType: FieldType.Element,
                            getElement: (
                                _item: Incident,
                                onBeforeFetchData: JSONObject | undefined,
                                fetchItems: VoidFunction | undefined
                            ): ReactElement => {
                                return (
                                    <ChangeIncidentState
                                        incidentId={modelId}
                                        incidentTimeline={
                                            onBeforeFetchData
                                                ? (onBeforeFetchData[
                                                      'data'
                                                  ] as Array<BaseModel>)
                                                : []
                                        }
                                        incidentType={IncidentType.Ack}
                                        onActionComplete={() => {
                                            fetchItems && fetchItems();
                                        }}
                                    />
                                );
                            },
                        },
                        {
                            title: 'Resolve Incident',
                            fieldType: FieldType.Element,
                            getElement: (
                                _item: Incident,
                                onBeforeFetchData: JSONObject | undefined,
                                fetchItems: VoidFunction | undefined
                            ): ReactElement => {
                                return (
                                    <ChangeIncidentState
                                        incidentId={modelId}
                                        incidentTimeline={
                                            onBeforeFetchData
                                                ? (onBeforeFetchData[
                                                      'data'
                                                  ] as Array<BaseModel>)
                                                : []
                                        }
                                        incidentType={IncidentType.Resolve}
                                        onActionComplete={() => {
                                            GlobalEvent.dispatchEvent(
                                                EventName.ACTIVE_INCIDENTS_COUNT_REFRESH
                                            );
                                            fetchItems && fetchItems();
                                        }}
                                    />
                                );
                            },
                        },
                    ],
                    modelId: modelId,
                }}
            />

            <CardModelDetail
                name="Incident Description"
                cardProps={{
                    title: 'Incident Description',
                    description:
                        'Description of this incident. This is visible on Status Page and is in markdown format.',
                }}
                editButtonText="Edit Incident Description"
                isEditable={true}
                formFields={[
                    {
                        field: {
                            description: true,
                        },
                        title: 'Description',

                        fieldType: FormFieldSchemaType.Markdown,
                        required: true,
                        placeholder: 'Description',
                    },
                ]}
                modelDetailProps={{
                    showDetailsInNumberOfColumns: 1,
                    modelType: Incident,
                    id: 'model-detail-incident-description',
                    fields: [
                        {
                            field: {
                                description: true,
                            },
                            title: 'Description',
                            fieldType: FieldType.Markdown,
                        },
                    ],
                    modelId: modelId,
                }}
            />

            <CardModelDetail
                name="Root Cause"
                cardProps={{
                    title: 'Root Cause',
                    description:
                        'Why did this incident happen? Here is the root cause of this incident.',
                }}
                isEditable={false}
                modelDetailProps={{
                    showDetailsInNumberOfColumns: 1,
                    modelType: Incident,
                    id: 'model-detail-incident-root-cause',
                    fields: [
                        {
                            field: {
                                rootCause: true,
                            },
                            title: 'Root Cause',
                            placeholder:
                                'No root cause identified for this incident.',
                            fieldType: FieldType.LongText,
                        },
                    ],
                    modelId: modelId,
                }}
            />
        </Fragment>
    );
};

export default IncidentView;
