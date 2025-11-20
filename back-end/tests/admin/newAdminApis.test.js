const request = require("supertest");
const app = require("../../app");
const { loginAs } = require("../testUtils");

describe("New Admin APIs", () => {
  let adminToken;

  beforeAll(async () => {
    adminToken = await loginAs("Admin");
  });

  // ===========================
  // Notifications
  // ===========================
  describe("Notifications API", () => {
    let createdNotificationId;

    it("should create a notification", async () => {
      const response = await request(app)
        .post("/admin/notifications")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          type: "System",
          message: "Test notification for user",
          userId: null, // global notification
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Notification created");
      expect(response.body.notification).toBeDefined();
      createdNotificationId = response.body.notification.id;
    });

    it("should fetch notifications", async () => {
      const response = await request(app)
        .get("/admin/notifications")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should fetch only unread notifications", async () => {
      const response = await request(app)
        .get("/admin/notifications?unreadOnly=true")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      response.body.forEach((n) => {
        expect(n.isRead).toBe(false);
      });
    });

    it("should mark a notification as read", async () => {
      const response = await request(app)
        .put(`/admin/notifications/${createdNotificationId}/read`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Notification marked as read");
      expect(response.body.notification.isRead).toBe(true);
    });

    it("should mark all notifications as read", async () => {
      const response = await request(app)
        .put("/admin/notifications/read-all")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("All notifications marked as read");
    });
  });

  // ===========================
  // Audit Logs
  // ===========================
  describe("Audit API", () => {
    let createdAuditId;

    it("should create an audit log", async () => {
      const response = await request(app)
        .post("/admin/audits")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          userId: "6890ae807022ccdc50802f07",
          action: "TEST_ACTION",
          resource: "Notification",
          details: "Created a test notification",
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Audit log created");
      createdAuditId = response.body.audit.id;
    });

    it('should fetch audit logs', async () => {
  const response = await request(app)
    .get('/admin/audits')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(response.status).toBe(200);
  expect(Array.isArray(response.body.data)).toBe(true);
  expect(response.body.data.length).toBeGreaterThan(0);
});

it('should filter audit logs by userId', async () => {
  const response = await request(app)
    .get('/admin/audits?userId=6890ae807022ccdc50802f07')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(response.status).toBe(200);
  expect(Array.isArray(response.body.data)).toBe(true);

  response.body.data.forEach((log) => {
    expect(log.userId).toBe("6890ae807022ccdc50802f07");
  });
    });
  });
});
