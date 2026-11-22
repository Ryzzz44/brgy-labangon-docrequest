package ph.brgylabangon.docrequest;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import ph.brgylabangon.docrequest.entity.RequestStatus;

/** Small unit test that needs no database: run with "mvn test". */
class RequestStatusTest {

    @Test
    void readsLabelsFromTheFrontend() {
        assertEquals(RequestStatus.READY_FOR_PICKUP, RequestStatus.from("Ready for Pickup"));
        assertEquals(RequestStatus.PENDING, RequestStatus.from("PENDING"));
    }

    @Test
    void onlyFinishedRequestsAreFinal() {
        assertTrue(RequestStatus.RELEASED.isFinal());
        assertTrue(RequestStatus.CANCELLED.isFinal());
        assertFalse(RequestStatus.PENDING.isFinal());
    }
}
