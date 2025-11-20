const request = require("supertest");
const app = require("../../app");
const { loginAs } = require("../testUtils");

describe("Admin Audit & Notification APIs", () => {
  let adminToken;
  let auditId;
  let notificationId;

  beforeAll(async () => {
    adminToken = await loginAs("Admin");
  });

  // ---------- AUDIT TESTS ----------
  describe("Audit API", () => {
    it("should create a new audit log", async () => {
      const res = await request(app)
        .post("/admin/audits")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          action: "Created Product",
          resource: "Product",
          details: JSON.stringify({
            productId: "p1",
            oldValue: null,
            newValue: "New Product"
          })
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("audit");
      auditId = res.body.audit.id;
    });

    it("should fetch audit logs", async () => {
      const res = await request(app)
        .get("/admin/audits")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ---------- NOTIFICATION TESTS ----------
  describe("Notification API", () => {
    it("should create a notification", async () => {
      const res = await request(app)
        .post("/admin/notifications")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          type: "Info",
          message: "System update scheduled",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("notification");
      notificationId = res.body.notification.id;
    });

    it("should fetch notifications", async () => {
      const res = await request(app)
        .get("/admin/notifications")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should mark a notification as read", async () => {
      const res = await request(app)
        .put(`/admin/notifications/${notificationId}/read`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.notification.isRead).toBe(true);
    });

    it("should mark all notifications as read", async () => {
      const res = await request(app)
        .put("/admin/notifications/read-all")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("All notifications marked as read");
    });
  });
});
