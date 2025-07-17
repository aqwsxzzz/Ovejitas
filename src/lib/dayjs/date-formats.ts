import dayjs from "dayjs";

export const formatDateByMonth = (date: string): string => {
	return dayjs(date, "YYYY-MM-DD").format("MMM DD YYYY");
};
