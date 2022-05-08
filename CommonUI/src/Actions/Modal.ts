import ModalConstants from '../Constants/Modal';
import {
    OpenModalActionPayload,
    CloseModalActionPayload,
} from '../PayloadTypes/Modal';
import Action from '../Types/Action';

export default class ModalAction {
    public openModalAction(payload: OpenModalActionPayload): Action {
        return new Action({
            type: ModalConstants.OPEN_MODAL,
            payload: payload,
        });
    }

    public closeModalAction(payload: CloseModalActionPayload): Action {
        return new Action({
            type: ModalConstants.CLOSE_MODAL,
            payload: payload,
        });
    }
}
