# Sample data (stand-ins)

Same shape as the JSON the backend returns. Use these when a groupmate's part is missing,
so your page still works on its own during your individual presentation:

```js
import { withSample } from '../../utils/withSample';
import sampleRequests from '../../data/sample-requests.json';

const { data, isSample } = await withSample(api.get('/api/resident/requests'), sampleRequests);
```

| File | Shape of |
|---|---|
| `sample-requests.json` | `RequestView` (backend `dto/RequestView.java`) |
| `sample-profile.json` | `ResidentProfile` (backend `dto/AuthDtos.java`) |
| `sample-staff.json` | `StaffProfile` |
| `sample-history.json` | transaction history rows |
| `sample-announcements.json` | announcements |
