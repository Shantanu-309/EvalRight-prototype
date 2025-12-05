using System.Collections.Generic;
using System.Threading.Tasks;
using EvalRight.Application.DTOs.Order;

namespace EvalRight.Application.Interfaces;

public interface IOrderService
{
    Task<OrderDetailDto> CreateOrderAsync(CreateOrderRequest request, long initiatedByAccountId);
    Task<OrderDetailDto?> GetOrderByIdAsync(long id);
    Task<List<OrderDto>> GetOrdersByClientIdAsync(long clientId);
}

