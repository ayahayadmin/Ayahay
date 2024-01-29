import { useState, useEffect } from 'react';
import { PaginatedRequest, PaginatedResponse } from '@ayahay/http';
import { TablePaginationConfig } from 'antd/es/table';
import { FilterValue, SorterResult } from 'antd/es/table/interface';

export function usePaginatedData<T>(
  fetchFn: (
    request: PaginatedRequest
  ) => Promise<PaginatedResponse<T> | undefined>,
  shouldLoad: boolean
) {
  const [dataInPage, setDataInPage] = useState<T[] | undefined>();
  const [totalCount, setTotalCount] = useState<number>(0);
  const [paginationConfig, setPaginationConfig] = useState<PaginatedRequest>({
    page: 1,
  });

  const fetchData = async () => {
    if (shouldLoad === false) {
      return;
    }

    const response = await fetchFn(paginationConfig);
    if (response === undefined) {
      return;
    }
    setDataInPage(response.data);
    setTotalCount(response.total);
  };

  useEffect(() => {
    fetchData();
  }, [paginationConfig, shouldLoad]);

  const resetData = () => {
    setDataInPage([]);
    setTotalCount(0);
    setPaginationConfig({ page: 1 });
  };

  const antdPagination = {
    current: paginationConfig.page,
    pageSize: 10,
    total: totalCount,
  };

  const antdOnChange = (pagination: TablePaginationConfig, _: any, __: any) => {
    setPaginationConfig({
      page: pagination.current ?? 1,
    });
  };

  return {
    dataInPage,
    totalCount,
    paginationConfig,
    antdPagination,
    antdOnChange,
    resetData,
  };
}
