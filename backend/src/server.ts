import app from "./app";
import { startJobAlertScheduler } from "./services/job-alert.service";

const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
  startJobAlertScheduler();
});
