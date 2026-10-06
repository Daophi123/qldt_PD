import app from "./src/app"
import { connectDB } from "./src/config/database";
import { environment } from "./src/config/environment"

const startServer = async() => {
  await connectDB();

  app.listen(environment.PORT, () => {
    console.log(`Server đang chạy tại: ${environment.BASE_URL}`);
  });
};

startServer();