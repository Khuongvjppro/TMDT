import { fetchJobDetail } from "../../../lib/api";
import JobApplyPanel from "../../../components/job-apply-panel";
import { formatSalaryRange, getCompanyLogoUrl } from "../../../lib/job-utils";

type JobDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function renderRichText(text: string) {
  const lines = text.split("\n").map((line) => line.trim());
  const elements: JSX.Element[] = [];
  let bullets: string[] = [];

  function flushBullets(key: number) {
    if (!bullets.length) return;
    elements.push(
      <ul
        key={`list-${key}`}
        className="list-disc space-y-1 pl-5 text-sm leading-7 text-slate-700"
      >
        {bullets.map((item, index) => (
          <li key={`item-${key}-${index}`}>{item}</li>
        ))}
      </ul>,
    );
    bullets = [];
  }

  lines.forEach((line, index) => {
    if (!line) {
      flushBullets(index);
      return;
    }

    const bulletMatch = line.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      bullets.push(bulletMatch[1]);
      return;
    }

    flushBullets(index);
    elements.push(
      <p key={`p-${index}`} className="text-sm leading-7 text-slate-700">
        {line}
      </p>,
    );
  });

  flushBullets(lines.length);
  return elements;
}

function renderBulletList(items: string[]) {
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm leading-7 text-slate-700">
      {items.map((item, index) => (
        <li key={`list-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const job = await fetchJobDetail(Number(id));

  const sampleBenefits = [
    "Lương: 10 - 50 triệu (tùy theo năng lực)",
    "Thưởng dự án, thưởng hiệu suất theo quý/năm",
    "Đóng BHXH, BHYT, BHTN đầy đủ theo quy định",
    "Cơ hội đào tạo, phát triển lộ trình nghề nghiệp",
    "Môi trường làm việc chuyên nghiệp, đồng đội hỗ trợ",
  ];
  const sampleWorkLocation = [
    "Hà Nội: Số 6A/183 Hoàng Văn Thái, Phường Phương Liệt",
    "Chi nhánh: Tầng 6, 219 Trung Kính, Cầu Giấy (nếu cần)",
  ];
  const sampleWorkTime = [
    "Thứ 2 - Thứ 7 (08:00 - 17:00)",
    "Nghỉ Chủ nhật và các ngày lễ theo quy định",
    "Linh hoạt 1 buổi/tuần theo kế hoạch đội nhóm",
  ];
  const sampleRequiredDocs = [
    "CV cập nhật, nêu rõ dự án đã tham gia",
    "Portfolio/Link sản phẩm (nếu có)",
    "Bằng cấp/chứng chỉ liên quan",
  ];
  const sampleHiringProcess = [
    "Sàng lọc hồ sơ (1-2 ngày)",
    "Phỏng vấn chuyên môn (1 vòng)",
    "Thông báo kết quả trong 3-5 ngày làm việc",
  ];
  const sampleContactInfo = [
    "Phòng Nhân sự: 0901 234 567",
    "Email: hr@congty.vn",
    "Thời gian nhận hồ sơ: 08:30 - 17:30",
  ];
  const sampleDescription = [
    "Thiết kế kiến trúc công trình dân dụng và nội thất theo định hướng dự án.",
    "Lên phương án thiết kế 2D/3D, triển khai bản vẽ kỹ thuật thi công.",
    "Phối hợp với các bộ phận liên quan để hoàn thiện hồ sơ thiết kế.",
    "Tham gia khảo sát hiện trạng, đo đạc và cập nhật hồ sơ hiện trường.",
    "Đảm bảo tính thẩm mỹ, kỹ thuật và khả thi trong thi công.",
  ];
  const sampleRequirements = [
    "Có kinh nghiệm thiết kế kiến trúc hoặc nội thất từ 1 năm trở lên.",
    "Thành thạo AutoCAD, SketchUp/3ds Max hoặc phần mềm tương đương.",
    "Hiểu biết về vật liệu, kết cấu và quy chuẩn xây dựng cơ bản.",
    "Tư duy thiết kế tốt, làm việc cẩn thận, chú trọng chi tiết.",
    "Có tinh thần trách nhiệm, chủ động và phối hợp tốt trong nhóm.",
  ];

  return (
    <section className="space-y-6">
      <div className="text-xs text-slate-500">
        Trang chủ / Việc làm /{" "}
        <span className="text-slate-700">{job.title}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <article className="rounded-[26px] bg-white/90 p-5 shadow-xl ring-1 ring-slate-100 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">
              {job.type.replace("_", " ")}
            </p>
            <h1 className="mt-2 text-2xl font-black text-slate-900 md:text-3xl">
              {job.title}
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">
              {job.companyName} • {job.location}
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                {formatSalaryRange(job.salaryMin, job.salaryMax)}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                {job.location}
              </span>
              <span className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-600">
                {job.type.replace("_", " ")}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                Ngay dang: {formatDate(job.createdAt)}
              </span>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8 12h8" />
                    <path d="M12 7v10" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Mức lương</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatSalaryRange(job.salaryMin, job.salaryMax)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 3a6 6 0 0 0-6 6c0 4.5 6 12 6 12s6-7.5 6-12a6 6 0 0 0-6-6z" />
                    <path d="M9.5 9.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Địa điểm</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {job.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 7h16" />
                    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <path d="M4 7v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7" />
                    <path d="M10 11h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Hình thức</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {job.type.replace("_", " ")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="#apply-panel"
                className="inline-flex items-center justify-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-brand-700"
              >
                Ứng tuyển ngay
              </a>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50"
              >
                Lưu tin
              </button>
            </div>
          </article>

          <article className="rounded-3xl bg-white p-6 shadow-md">
            <h2 className="text-xl font-bold text-slate-900">
              Chi tiết công việc
            </h2>
            <div className="mt-4 space-y-6">
              <section>
                <h3 className="text-base font-semibold text-slate-900">
                  Mô tả công việc
                </h3>
                <div className="mt-2 space-y-2">
                  {renderRichText(job.description)}
                </div>
                <div className="mt-3">
                  {renderBulletList(sampleDescription)}
                </div>
              </section>
              <div className="h-px w-full bg-slate-100" />
              <section>
                <h3 className="text-base font-semibold text-slate-900">
                  Yêu cầu ứng viên
                </h3>
                <div className="mt-2 space-y-2">
                  {renderRichText(job.requirements)}
                </div>
                <div className="mt-3">
                  {renderBulletList(sampleRequirements)}
                </div>
              </section>
              <div className="h-px w-full bg-slate-100" />
              <section>
                <h3 className="text-base font-semibold text-slate-900">
                  Quyền lợi
                </h3>
                <div className="mt-2">{renderBulletList(sampleBenefits)}</div>
              </section>
              <div className="h-px w-full bg-slate-100" />
              <section>
                <h3 className="text-base font-semibold text-slate-900">
                  Địa điểm làm việc
                </h3>
                <div className="mt-2">
                  {renderBulletList(sampleWorkLocation)}
                </div>
              </section>
              <section>
                <h3 className="text-base font-semibold text-slate-900">
                  Thời gian làm việc
                </h3>
                <div className="mt-2">{renderBulletList(sampleWorkTime)}</div>
              </section>
              <div className="h-px w-full bg-slate-100" />
              <section>
                <h3 className="text-base font-semibold text-slate-900">
                  Hồ sơ yêu cầu
                </h3>
                <div className="mt-2">
                  {renderBulletList(sampleRequiredDocs)}
                </div>
              </section>
              <section>
                <h3 className="text-base font-semibold text-slate-900">
                  Quy trình tuyển dụng
                </h3>
                <div className="mt-2">
                  {renderBulletList(sampleHiringProcess)}
                </div>
              </section>
              <section>
                <h3 className="text-base font-semibold text-slate-900">
                  Thông tin liên hệ
                </h3>
                <div className="mt-2">
                  {renderBulletList(sampleContactInfo)}
                </div>
              </section>
            </div>
          </article>

          <div id="apply-panel">
            <JobApplyPanel jobId={job.id} />
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6">
          <article className="rounded-3xl bg-white p-6 shadow-md">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                <img
                  src={getCompanyLogoUrl(job.companyName)}
                  alt={`${job.companyName} logo`}
                  className="h-12 w-12 rounded-xl object-cover"
                  loading="lazy"
                />
              </div>
              <div>
                <p className="text-xs text-slate-500">Công ty</p>
                <p className="text-base font-semibold text-slate-900">
                  {job.companyName}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Địa điểm</span>
                <span className="font-medium text-slate-900">
                  {job.location}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Quy mô</span>
                <span className="font-medium text-slate-900">
                  Chưa cập nhật
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Lĩnh vực</span>
                <span className="font-medium text-slate-900">
                  Chưa cập nhật
                </span>
              </div>
            </div>
          </article>

          <article className="rounded-3xl bg-white p-6 shadow-md">
            <h3 className="text-base font-semibold text-slate-900">
              Thông tin chung
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Mã việc làm</span>
                <span className="font-medium text-slate-900">#{job.id}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Trạng thái</span>
                <span className="font-medium text-slate-900">
                  {job.isActive ? "Đang tuyển" : "Tạm dừng"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Ngày đăng</span>
                <span className="font-medium text-slate-900">
                  {formatDate(job.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Hình thức</span>
                <span className="font-medium text-slate-900">
                  {job.type.replace("_", " ")}
                </span>
              </div>
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}
