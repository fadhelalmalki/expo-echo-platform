package org.fadhel.expoechoplatform.dto;

import org.fadhel.expoechoplatform.domain.Category;

public record CategoryDto(
        Long id,
        String code,
        String nameEn,
        String nameAr,
        String colorStart,
        String colorEnd,
        String icon
) {
    public static CategoryDto from(Category c) {
        if (c == null) {
            return null;
        }
        return new CategoryDto(c.getId(), c.getCode(), c.getNameEn(), c.getNameAr(),
                c.getColorStart(), c.getColorEnd(), c.getIcon());
    }
}
